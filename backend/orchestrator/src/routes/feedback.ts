import { Hono } from "hono";
import { appLogger } from "@stock-advisor/shared";
import { getAuthUser } from "../middleware/auth.js";
import { findOrCreateUser } from "../infra/user-repo.js";
import { saveFeedback } from "../infra/feedback-repo.js";

export const feedbackRoutes = new Hono();
const logger = appLogger("orchestrator:feedback");

// POST /v1/feedback
feedbackRoutes.post("/", async (c) => {
  const authUser = getAuthUser(c);
  const body = await c.req.json<{
    suggestionId: string;
    helpful: boolean;
  }>();

  logger.info("Feedback received", { uid: authUser.uid, suggestionId: body.suggestionId });

  const userResult = await findOrCreateUser(authUser.uid, authUser.email);
  if (userResult.isErr()) {
    return c.json({ error: "Failed to resolve user" }, 500);
  }

  const result = await saveFeedback(userResult.value.id, body.suggestionId, body.helpful);

  return result.match(
    (feedback) => c.json(feedback, 201),
    (error) => c.json({ error: error.message }, 500),
  );
});
