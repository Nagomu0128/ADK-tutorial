import { Hono } from "hono";
import { appLogger } from "@stock-advisor/shared";
import { getAuthUser } from "../middleware/auth.js";
import { findOrCreateUser } from "../infra/user-repo.js";
import { getWatchlist } from "../infra/watchlist-repo.js";
import {
  createResearch,
  updateResearchStatus,
  saveNewsResults,
  saveStockResults,
  saveSentimentResults,
  saveRiskAssessment,
  saveReport,
  getResearchById,
  getResearchHistory,
  deleteOldResearch,
} from "../infra/research-repo.js";
import { runResearchPipeline } from "../service/research-pipeline.js";

export const researchRoutes = new Hono();
const logger = appLogger("orchestrator:research");

// POST /v1/research - Trigger daily research
researchRoutes.post("/", async (c) => {
  const authUser = getAuthUser(c);
  const body = await c.req.json<{ date?: string }>();
  const date = body.date ?? new Date().toISOString().split("T")[0]!;

  logger.info("Research triggered", { uid: authUser.uid, date });

  // Find or create user
  const userResult = await findOrCreateUser(authUser.uid, authUser.email);
  if (userResult.isErr()) {
    return c.json({ error: "Failed to resolve user" }, 500);
  }
  const userId = userResult.value.id;

  // Get watchlist
  const watchlistResult = await getWatchlist(userId);
  if (watchlistResult.isErr()) {
    return c.json({ error: "Failed to get watchlist" }, 500);
  }
  const symbols = watchlistResult.value.symbols.map((s) => s.symbol);

  if (symbols.length === 0) {
    return c.json({ error: "Watchlist is empty. Add symbols first." }, 400);
  }

  // Create research record
  const researchIdResult = await createResearch(userId, date);
  if (researchIdResult.isErr()) {
    return c.json({ error: "Failed to create research record" }, 500);
  }
  const researchId = researchIdResult.value;

  // Run pipeline
  const pipelineResult = await runResearchPipeline({ userId, symbols, date });

  return pipelineResult.match(
    async (data) => {
      // Save all results to DB (fire-and-forget style, don't block response)
      await Promise.all([
        saveNewsResults(researchId, data.news),
        saveStockResults(researchId, data.stocks),
        saveSentimentResults(researchId, data.sentiments),
        saveRiskAssessment(researchId, data.riskAssessment),
        saveReport(researchId, data.report),
        updateResearchStatus(researchId, "completed", data.agentStatuses),
      ]);

      // Cleanup old research
      deleteOldResearch();

      return c.json({
        id: researchId,
        userId,
        date,
        status: "completed",
        agentStatuses: data.agentStatuses,
        newsResults: data.news,
        stockResults: data.stocks,
        sentimentResults: data.sentiments,
        riskAssessment: data.riskAssessment,
        report: data.report,
      });
    },
    async (error) => {
      logger.error(`Research failed: ${error.message}`);
      await updateResearchStatus(researchId, "failed", []);
      return c.json({ error: error.message }, 500);
    },
  );
});

// GET /v1/research/:researchId - Get research result
researchRoutes.get("/:researchId", async (c) => {
  const researchId = c.req.param("researchId");

  const result = await getResearchById(researchId);

  return result.match(
    (data) => {
      if (!data) return c.json({ error: "Research not found" }, 404);
      return c.json(data);
    },
    (error) => c.json({ error: error.message }, 500),
  );
});

// GET /v1/research/history - Get research history
researchRoutes.get("/history", async (c) => {
  const authUser = getAuthUser(c);

  const userResult = await findOrCreateUser(authUser.uid, authUser.email);
  if (userResult.isErr()) {
    return c.json({ error: "Failed to resolve user" }, 500);
  }

  const result = await getResearchHistory(userResult.value.id);

  return result.match(
    (history) => c.json({ history }),
    (error) => c.json({ error: error.message }, 500),
  );
});
