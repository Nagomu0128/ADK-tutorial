import { Hono } from "hono";
import { appLogger } from "@stock-advisor/shared";
import { runResearchPipeline } from "../service/research-pipeline.js";

export const researchRoutes = new Hono();
const logger = appLogger("orchestrator:research");

// POST /v1/research - Trigger daily research
researchRoutes.post("/", async (c) => {
  const body = await c.req.json<{
    symbols: string[];
    date?: string;
  }>();

  // TODO: Get userId from Firebase Auth via getAuthUser(c)
  const userId = "demo-user";
  const date = body.date ?? new Date().toISOString().split("T")[0]!;

  logger.info("Research triggered", { userId, symbols: body.symbols, date });

  const result = await runResearchPipeline({
    userId,
    symbols: body.symbols,
    date,
  });

  return result.match(
    (data) =>
      c.json({
        id: crypto.randomUUID(),
        userId,
        date,
        status: "completed",
        agentStatuses: data.agentStatuses,
        newsResults: data.news,
        stockResults: data.stocks,
        sentimentResults: data.sentiments,
        riskAssessment: data.riskAssessment,
        report: data.report,
      }),
    (error) => {
      logger.error(`Research failed: ${error.message}`);
      return c.json({ error: error.message }, 500);
    },
  );
});

// GET /v1/research/:researchId - Get research result
researchRoutes.get("/:researchId", async (c) => {
  const researchId = c.req.param("researchId");
  // TODO: Fetch from DB
  return c.json({ message: "Not implemented yet", researchId });
});

// GET /v1/research/history - Get research history
researchRoutes.get("/history", async (c) => {
  // TODO: Fetch from DB
  return c.json({ history: [] });
});
