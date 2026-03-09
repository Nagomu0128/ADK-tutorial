import { Hono } from "hono";
import { appLogger } from "@stock-advisor/shared";

export const profileRoutes = new Hono();
const logger = appLogger("orchestrator:profile");

// GET /v1/profile - Get user profile
profileRoutes.get("/", async (c) => {
  // TODO: Get userId from Firebase Auth, fetch from DB
  logger.info("Fetching user profile");
  return c.json({
    id: "demo-profile",
    userId: "demo-user",
    investmentStyle: "long_term",
    riskTolerance: "balanced",
    experienceLevel: "beginner",
    interestedSectors: ["technology", "healthcare"],
    watchThemes: ["AI", "EV"],
    updatedAt: new Date().toISOString(),
  });
});

// PUT /v1/profile - Update user profile
profileRoutes.put("/", async (c) => {
  const body = await c.req.json<{
    investmentStyle?: string;
    riskTolerance?: string;
    experienceLevel?: string;
    interestedSectors?: string[];
    watchThemes?: string[];
  }>();
  logger.info("Updating user profile", body);
  // TODO: Save to DB
  return c.json({ success: true, ...body });
});
