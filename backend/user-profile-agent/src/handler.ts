import { ResultAsync } from "neverthrow";
import { match } from "ts-pattern";
import {
  errorBuilder,
  type InferError,
  appLogger,
  type UserProfile,
  runAgentOnce,
  query,
} from "@stock-advisor/shared";

export const ProfileError = errorBuilder("ProfileError");
export type ProfileError = InferError<typeof ProfileError>;

const logger = appLogger("user-profile-agent:handler");

type GetProfileInput = {
  readonly userId: string;
};

type ProfileOutput = {
  readonly profile: UserProfile;
  readonly preferenceSummary: string;
};

type ProfileRow = {
  readonly id: string;
  readonly user_id: string;
  readonly investment_style: UserProfile["investmentStyle"];
  readonly risk_tolerance: UserProfile["riskTolerance"];
  readonly experience_level: UserProfile["experienceLevel"];
  readonly interested_sectors: readonly string[];
  readonly watch_themes: readonly string[];
  readonly preference_model: Record<string, unknown>;
  readonly updated_at: string;
};

const defaultProfile = (userId: string): UserProfile => ({
  id: crypto.randomUUID(),
  userId,
  investmentStyle: "long_term",
  riskTolerance: "balanced",
  experienceLevel: "beginner",
  interestedSectors: ["technology", "healthcare"],
  watchThemes: ["AI", "EV"],
  preferenceModel: {},
  updatedAt: new Date().toISOString(),
});

const fetchProfileFromDB = (
  userId: string,
): ResultAsync<UserProfile, ProfileError> =>
  ResultAsync.fromPromise(
    query<ProfileRow>(
      "SELECT * FROM user_profiles WHERE user_id = $1",
      [userId],
    ).then((result) => {
      const row = result.rows[0];
      if (!row) return defaultProfile(userId);
      return {
        id: row.id,
        userId: row.user_id,
        investmentStyle: row.investment_style,
        riskTolerance: row.risk_tolerance,
        experienceLevel: row.experience_level,
        interestedSectors: row.interested_sectors,
        watchThemes: row.watch_themes,
        preferenceModel: row.preference_model,
        updatedAt: row.updated_at,
      };
    }),
    ProfileError.handle,
  ).orElse(() =>
    // Fallback if DB is not available
    ResultAsync.fromSafePromise(Promise.resolve(defaultProfile(userId))),
  );

const generatePreferenceSummary = (
  profile: UserProfile,
): ResultAsync<string, ProfileError> => {
  const styleName = match(profile.investmentStyle)
    .with("short_term", () => "短期トレード")
    .with("swing", () => "スイングトレード")
    .with("long_term", () => "中長期投資")
    .with("dividend", () => "配当重視投資")
    .exhaustive();

  const riskName = match(profile.riskTolerance)
    .with("conservative", () => "保守的")
    .with("balanced", () => "バランス型")
    .with("aggressive", () => "積極的")
    .exhaustive();

  const levelName = match(profile.experienceLevel)
    .with("beginner", () => "初心者")
    .with("intermediate", () => "中級者")
    .with("advanced", () => "上級者")
    .exhaustive();

  return ResultAsync.fromPromise(
    runAgentOnce(
      {
        name: "profile_summarizer",
        description: "Generates investor profile summary",
        instruction: `Generate a brief Japanese summary (2-3 sentences) describing an investor's profile for use as context in recommendations. Respond with ONLY the summary text.`,
      },
      `Profile: style=${styleName}, risk=${riskName}, experience=${levelName}, sectors=${profile.interestedSectors.join(",")}, themes=${profile.watchThemes.join(",")}`,
    ),
    ProfileError.handle,
  );
};

export const handleGetUserProfile = (
  input: GetProfileInput,
): ResultAsync<ProfileOutput, ProfileError> => {
  logger.info("Fetching user profile", { userId: input.userId });

  return fetchProfileFromDB(input.userId).andThen((profile) =>
    generatePreferenceSummary(profile).map((preferenceSummary) => ({
      profile,
      preferenceSummary,
    })),
  );
};
