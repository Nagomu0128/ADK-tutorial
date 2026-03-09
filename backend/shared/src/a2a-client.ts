import { ResultAsync } from "neverthrow";
import { errorBuilder, type InferError } from "./error.js";

export const A2AError = errorBuilder("A2AError");
export type A2AError = InferError<typeof A2AError>;

// Agent registry - maps agent names to their base URLs
export type AgentRegistry = {
  readonly newsAgent: string;
  readonly stockAgent: string;
  readonly sentimentAgent: string;
  readonly userProfileAgent: string;
  readonly riskAgent: string;
  readonly reportAgent: string;
};

const getEnvOrDefault = (key: string, defaultValue: string): string =>
  process.env[key] ?? defaultValue;

export const createAgentRegistry = (): AgentRegistry => ({
  newsAgent: getEnvOrDefault("NEWS_AGENT_URL", "http://localhost:3002"),
  stockAgent: getEnvOrDefault("STOCK_AGENT_URL", "http://localhost:3003"),
  sentimentAgent: getEnvOrDefault("SENTIMENT_AGENT_URL", "http://localhost:3004"),
  userProfileAgent: getEnvOrDefault("USER_PROFILE_AGENT_URL", "http://localhost:3005"),
  riskAgent: getEnvOrDefault("RISK_AGENT_URL", "http://localhost:3006"),
  reportAgent: getEnvOrDefault("REPORT_AGENT_URL", "http://localhost:3007"),
});

// A2A JSON-RPC client for sending messages to remote agents
export const sendA2AMessage = <T>(
  agentUrl: string,
  message: string,
): ResultAsync<T, A2AError> =>
  ResultAsync.fromPromise(
    fetch(`${agentUrl}/a2a/jsonrpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: crypto.randomUUID(),
        method: "message/send",
        params: {
          message: {
            messageId: crypto.randomUUID(),
            role: "user",
            parts: [{ kind: "text", text: message }],
            kind: "message",
          },
        },
      }),
    }).then(async (res) => {
      if (!res.ok) {
        throw new Error(`A2A request failed: ${res.status} ${res.statusText}`);
      }
      const body = await res.json();
      // Extract the agent's response from the A2A JSON-RPC result
      if (body.error) {
        throw new Error(`A2A error: ${body.error.message}`);
      }
      // Parse the text part of the response as JSON
      const textPart = body.result?.parts?.find((p: { kind: string }) => p.kind === "text");
      return textPart ? JSON.parse(textPart.text) : body.result;
    }),
    A2AError.handle,
  );

// Simple REST-based A2A task for structured data exchange
export const sendA2ATask = <T>(
  agentUrl: string,
  task: { readonly taskType: string; readonly input: unknown },
): ResultAsync<T, A2AError> =>
  ResultAsync.fromPromise(
    fetch(`${agentUrl}/a2a/task`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    }).then(async (res) => {
      if (!res.ok) {
        throw new Error(`A2A request failed: ${res.status} ${res.statusText}`);
      }
      const body = await res.json();
      if (!body.success) {
        throw new Error("A2A task returned failure");
      }
      return body.data;
    }),
    A2AError.handle,
  );
