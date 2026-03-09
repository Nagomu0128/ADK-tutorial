import { ResultAsync } from "neverthrow";
import {
  query,
  errorBuilder,
  type InferError,
  appLogger,
  type UserProfile,
  type InvestmentStyle,
  type RiskTolerance,
  type ExperienceLevel,
} from "@stock-advisor/shared";

export const ProfileRepoError = errorBuilder("ProfileRepoError");
export type ProfileRepoError = InferError<typeof ProfileRepoError>;

const logger = appLogger("orchestrator:profile-repo");

type ProfileRow = {
  readonly id: string;
  readonly user_id: string;
  readonly investment_style: InvestmentStyle;
  readonly risk_tolerance: RiskTolerance;
  readonly experience_level: ExperienceLevel;
  readonly interested_sectors: readonly string[];
  readonly watch_themes: readonly string[];
  readonly preference_model: Record<string, unknown>;
  readonly updated_at: string;
};

const toUserProfile = (row: ProfileRow): UserProfile => ({
  id: row.id,
  userId: row.user_id,
  investmentStyle: row.investment_style,
  riskTolerance: row.risk_tolerance,
  experienceLevel: row.experience_level,
  interestedSectors: row.interested_sectors,
  watchThemes: row.watch_themes,
  preferenceModel: row.preference_model,
  updatedAt: row.updated_at,
});

export const findProfileByUserId = (
  userId: string,
): ResultAsync<UserProfile | null, ProfileRepoError> =>
  ResultAsync.fromPromise(
    query<ProfileRow>(
      "SELECT * FROM user_profiles WHERE user_id = $1",
      [userId],
    ).then((result) => (result.rows[0] ? toUserProfile(result.rows[0]) : null)),
    ProfileRepoError.handle,
  );

export const upsertProfile = (
  userId: string,
  profile: Partial<Pick<UserProfile, "investmentStyle" | "riskTolerance" | "experienceLevel" | "interestedSectors" | "watchThemes">>,
): ResultAsync<UserProfile, ProfileRepoError> =>
  ResultAsync.fromPromise(
    query<ProfileRow>(
      `INSERT INTO user_profiles (user_id, investment_style, risk_tolerance, experience_level, interested_sectors, watch_themes)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) DO UPDATE SET
         investment_style = COALESCE($2, user_profiles.investment_style),
         risk_tolerance = COALESCE($3, user_profiles.risk_tolerance),
         experience_level = COALESCE($4, user_profiles.experience_level),
         interested_sectors = COALESCE($5, user_profiles.interested_sectors),
         watch_themes = COALESCE($6, user_profiles.watch_themes),
         updated_at = NOW()
       RETURNING *`,
      [
        userId,
        profile.investmentStyle ?? "long_term",
        profile.riskTolerance ?? "balanced",
        profile.experienceLevel ?? "beginner",
        profile.interestedSectors ?? [],
        profile.watchThemes ?? [],
      ],
    ).then((result) => {
      const row = result.rows[0];
      if (!row) throw new Error("Failed to upsert profile");
      logger.info("Profile upserted", { userId });
      return toUserProfile(row);
    }),
    ProfileRepoError.handle,
  );
