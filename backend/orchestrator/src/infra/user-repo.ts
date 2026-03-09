import { ResultAsync } from "neverthrow";
import { query, errorBuilder, type InferError, appLogger } from "@stock-advisor/shared";

export const UserRepoError = errorBuilder("UserRepoError");
export type UserRepoError = InferError<typeof UserRepoError>;

const logger = appLogger("orchestrator:user-repo");

type UserRow = {
  readonly id: string;
  readonly email: string;
  readonly firebase_uid: string;
  readonly created_at: string;
};

export const findOrCreateUser = (
  firebaseUid: string,
  email: string,
): ResultAsync<UserRow, UserRepoError> =>
  ResultAsync.fromPromise(
    query<UserRow>(
      `INSERT INTO users (firebase_uid, email)
       VALUES ($1, $2)
       ON CONFLICT (firebase_uid) DO UPDATE SET email = EXCLUDED.email
       RETURNING *`,
      [firebaseUid, email],
    ).then((result) => {
      const user = result.rows[0];
      if (!user) throw new Error("Failed to create/find user");
      logger.info("User found/created", { uid: firebaseUid });
      return user;
    }),
    UserRepoError.handle,
  );

export const findUserByUid = (
  firebaseUid: string,
): ResultAsync<UserRow | null, UserRepoError> =>
  ResultAsync.fromPromise(
    query<UserRow>(
      "SELECT * FROM users WHERE firebase_uid = $1",
      [firebaseUid],
    ).then((result) => result.rows[0] ?? null),
    UserRepoError.handle,
  );
