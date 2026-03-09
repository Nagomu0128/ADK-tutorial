import { Hono } from "hono";
import { appLogger } from "@stock-advisor/shared";

export const feedbackRoutes = new Hono();
const logger = appLogger("orchestrator:feedback");

// POST /v1/feedback - Submit feedback
feedbackRoutes.post("/", async (c) => {
  const body = await c.req.json<{
    suggestionId: string;
    helpful: boolean;
  }>();

  // TODO: Get userId from Firebase Auth, save to DB
  logger.info("Feedback received", { suggestionId: body.suggestionId, helpful: body.helpful });

  return c.json({
    id: crypto.randomUUID(),
    userId: "demo-user",
    suggestionId: body.suggestionId,
    helpful: body.helpful,
    createdAt: new Date().toISOString(),
  }, 201);
});
