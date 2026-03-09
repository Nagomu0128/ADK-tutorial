import { Hono } from "hono";
import { appLogger, type InvestmentStyle, type RiskTolerance, type ExperienceLevel } from "@stock-advisor/shared";
import { getAuthUser } from "../middleware/auth.js";
import { findOrCreateUser } from "../infra/user-repo.js";
import { findProfileByUserId, upsertProfile } from "../infra/profile-repo.js";

export const profileRoutes = new Hono();
const logger = appLogger("orchestrator:profile");

// GET /v1/profile
profileRoutes.get("/", async (c) => {
  const authUser = getAuthUser(c);

  const userResult = await findOrCreateUser(authUser.uid, authUser.email);
  if (userResult.isErr()) {
    return c.json({ error: "Failed to resolve user" }, 500);
  }

  const result = await findProfileByUserId(userResult.value.id);

  return result.match(
    (profile) => {
      if (!profile) {
        return c.json({
          investmentStyle: "long_term",
          riskTolerance: "balanced",
          experienceLevel: "beginner",
          interestedSectors: [],
          watchThemes: [],
        });
      }
      return c.json(profile);
    },
    (error) => c.json({ error: error.message }, 500),
  );
});

// PUT /v1/profile
profileRoutes.put("/", async (c) => {
  const authUser = getAuthUser(c);
  const body = await c.req.json<{
    investmentStyle?: InvestmentStyle;
    riskTolerance?: RiskTolerance;
    experienceLevel?: ExperienceLevel;
    interestedSectors?: string[];
    watchThemes?: string[];
  }>();

  logger.info("Updating profile", { uid: authUser.uid });

  const userResult = await findOrCreateUser(authUser.uid, authUser.email);
  if (userResult.isErr()) {
    return c.json({ error: "Failed to resolve user" }, 500);
  }

  const result = await upsertProfile(userResult.value.id, body);

  return result.match(
    (profile) => c.json(profile),
    (error) => c.json({ error: error.message }, 500),
  );
});
