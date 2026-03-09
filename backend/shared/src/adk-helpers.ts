import { LlmAgent, InMemoryRunner, createSession } from "@google/adk";

type AgentConfig = {
  readonly name: string;
  readonly model?: string;
  readonly description: string;
  readonly instruction: string;
};

/**
 * Run an LlmAgent with a single user message and return the text response.
 */
export const runAgentOnce = async (
  agentConfig: AgentConfig,
  userMessage: string,
): Promise<string> => {
  const agent = new LlmAgent({
    name: agentConfig.name,
    model: agentConfig.model ?? "gemini-2.0-flash",
    description: agentConfig.description,
    instruction: agentConfig.instruction,
    tools: [],
  });

  const runner = new InMemoryRunner({ agent, appName: agentConfig.name });

  const session = createSession({
    id: crypto.randomUUID(),
    appName: agentConfig.name,
    userId: "system",
  });

  const response = runner.runAsync({
    userId: "system",
    sessionId: session.id,
    newMessage: {
      role: "user",
      parts: [{ text: userMessage }],
    },
  });

  const events = [];
  for await (const event of response) {
    events.push(event);
  }

  const lastEvent = events.findLast(
    (e) => e.content?.parts?.some((p: { text?: string }) => p.text),
  );

  return lastEvent?.content?.parts?.find(
    (p: { text?: string }) => p.text,
  )?.text ?? "";
};

/**
 * Run an LlmAgent and parse the JSON response.
 */
export const runAgentForJson = async <T>(
  agentConfig: AgentConfig,
  userMessage: string,
): Promise<T> => {
  const text = await runAgentOnce(agentConfig, userMessage);
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned) as T;
};
