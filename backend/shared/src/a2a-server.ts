import { Hono } from "hono";
import { AGENT_CARD_PATH } from "@a2a-js/sdk";
import {
  DefaultRequestHandler,
  InMemoryTaskStore,
  JsonRpcTransportHandler,
} from "@a2a-js/sdk/server";
import type { RequestContext, ExecutionEventBus } from "@a2a-js/sdk/server";
import type { ResultAsync } from "neverthrow";
import { appLogger } from "./logger.js";

type AgentSkill = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly tags: readonly string[];
};

type AgentCardConfig = {
  readonly name: string;
  readonly description: string;
  readonly url: string;
  readonly skills: readonly AgentSkill[];
};

type A2AServerConfig<TInput, TOutput, TError extends { message: string; type: string }> = {
  readonly agentCard: AgentCardConfig;
  readonly taskHandler: (input: TInput) => ResultAsync<TOutput, TError>;
};

export const createA2AServer = <TInput, TOutput, TError extends { message: string; type: string }>(
  config: A2AServerConfig<TInput, TOutput, TError>,
): Hono => {
  const app = new Hono();
  const loggerInstance = appLogger(`${config.agentCard.name}:a2a`);

  const agentCard = {
    name: config.agentCard.name,
    description: config.agentCard.description,
    protocolVersion: "0.3.0",
    version: "1.0.0",
    url: `${config.agentCard.url}/a2a/jsonrpc`,
    skills: config.agentCard.skills.map((s) => ({ ...s, tags: [...s.tags] })),
    capabilities: { pushNotifications: false },
    defaultInputModes: ["text"],
    defaultOutputModes: ["text"],
  };

  const taskStore = new InMemoryTaskStore();

  const agentExecutor = {
    execute: async (requestContext: RequestContext, eventBus: ExecutionEventBus) => {
      const userMessage = requestContext.userMessage;
      const textPart = userMessage?.parts?.find(
        (p: { kind: string }) => p.kind === "text",
      );
      const inputText = textPart ? (textPart as { text: string }).text : "{}";

      loggerInstance.info("A2A execute received", { input: inputText.slice(0, 100) });

      const parsed = JSON.parse(inputText) as TInput;
      const result = await config.taskHandler(parsed);

      const responseText = result.match(
        (data) => JSON.stringify(data),
        (error) => JSON.stringify({ error: error.message, type: error.type }),
      );

      eventBus.publish({
        kind: "message",
        messageId: crypto.randomUUID(),
        role: "agent",
        parts: [{ kind: "text", text: responseText }],
        contextId: requestContext.contextId,
      });
      eventBus.finished();
    },
    cancelTask: async () => {},
  };

  const requestHandler = new DefaultRequestHandler(
    agentCard,
    taskStore,
    agentExecutor,
  );

  const jsonRpcHandler = new JsonRpcTransportHandler(requestHandler);

  // Agent Card discovery endpoint
  app.get(`/${AGENT_CARD_PATH}`, (c) => c.json(agentCard));

  // A2A JSON-RPC endpoint
  app.post("/a2a/jsonrpc", async (c) => {
    const body = await c.req.json();
    const result = await jsonRpcHandler.handle(body);
    return c.json(result);
  });

  // REST-based task endpoint (backward compatible, simpler)
  app.post("/a2a/task", async (c) => {
    const body = await c.req.json<{ taskType: string; input: TInput }>();
    loggerInstance.info("REST A2A task received", { taskType: body.taskType });

    const taskResult = await config.taskHandler(body.input);

    return taskResult.match(
      (data) => c.json({ success: true, data }),
      (error) => {
        loggerInstance.error(`A2A task failed: ${error.message}`, { errorType: error.type });
        return c.json({ success: false, error: { type: error.type, message: error.message } }, 500);
      },
    );
  });

  // Health check
  app.get("/health", (c) => c.json({ status: "ok", service: config.agentCard.name }));

  return app;
};
