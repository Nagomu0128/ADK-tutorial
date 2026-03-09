import { ResultAsync } from "neverthrow";
import { query, errorBuilder, type InferError, appLogger, type UserFeedback } from "@stock-advisor/shared";

export const FeedbackRepoError = errorBuilder("FeedbackRepoError");
export type FeedbackRepoError = InferError<typeof FeedbackRepoError>;

const logger = appLogger("orchestrator:feedback-repo");

type FeedbackRow = {
  readonly id: string;
  readonly user_id: string;
  readonly suggestion_id: string;
  readonly helpful: boolean;
  readonly created_at: string;
};

export const saveFeedback = (
  userId: string,
  suggestionId: string,
  helpful: boolean,
): ResultAsync<UserFeedback, FeedbackRepoError> =>
  ResultAsync.fromPromise(
    query<FeedbackRow>(
      `INSERT INTO user_feedback (user_id, suggestion_id, helpful)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, suggestion_id) DO UPDATE SET helpful = EXCLUDED.helpful
       RETURNING *`,
      [userId, suggestionId, helpful],
    ).then((result) => {
      const row = result.rows[0];
      if (!row) throw new Error("Failed to save feedback");
      logger.info("Feedback saved", { userId, suggestionId, helpful });
      return {
        id: row.id,
        userId: row.user_id,
        suggestionId: row.suggestion_id,
        helpful: row.helpful,
        createdAt: row.created_at,
      };
    }),
    FeedbackRepoError.handle,
  );
