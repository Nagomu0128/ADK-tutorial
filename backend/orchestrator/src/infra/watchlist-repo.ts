import { ResultAsync } from "neverthrow";
import {
  query,
  errorBuilder,
  type InferError,
  appLogger,
  type Watchlist,
  type WatchlistItem,
  type Market,
} from "@stock-advisor/shared";

export const WatchlistRepoError = errorBuilder("WatchlistRepoError");
export type WatchlistRepoError = InferError<typeof WatchlistRepoError>;

const logger = appLogger("orchestrator:watchlist-repo");

type WatchlistRow = { readonly id: string; readonly user_id: string };
type ItemRow = {
  readonly id: string;
  readonly watchlist_id: string;
  readonly symbol: string;
  readonly market: Market;
  readonly added_at: string;
};

const findOrCreateWatchlist = async (userId: string): Promise<string> => {
  const result = await query<WatchlistRow>(
    `INSERT INTO watchlists (user_id) VALUES ($1)
     ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
     RETURNING id`,
    [userId],
  );
  const row = result.rows[0];
  if (!row) throw new Error("Failed to find/create watchlist");
  return row.id;
};

export const getWatchlist = (
  userId: string,
): ResultAsync<Watchlist, WatchlistRepoError> =>
  ResultAsync.fromPromise(
    (async () => {
      const watchlistId = await findOrCreateWatchlist(userId);
      const items = await query<ItemRow>(
        "SELECT * FROM watchlist_items WHERE watchlist_id = $1 ORDER BY added_at DESC",
        [watchlistId],
      );
      return {
        id: watchlistId,
        userId,
        symbols: items.rows.map((item) => ({
          symbol: item.symbol,
          market: item.market,
          addedAt: item.added_at,
        })),
      };
    })(),
    WatchlistRepoError.handle,
  );

export const addSymbol = (
  userId: string,
  symbol: string,
  market: Market,
): ResultAsync<WatchlistItem, WatchlistRepoError> =>
  ResultAsync.fromPromise(
    (async () => {
      const watchlistId = await findOrCreateWatchlist(userId);

      // Check max 20 symbols
      const count = await query<{ count: string }>(
        "SELECT COUNT(*) as count FROM watchlist_items WHERE watchlist_id = $1",
        [watchlistId],
      );
      if (parseInt(count.rows[0]?.count ?? "0", 10) >= 20) {
        throw new Error("Maximum 20 symbols allowed");
      }

      const result = await query<ItemRow>(
        `INSERT INTO watchlist_items (watchlist_id, symbol, market)
         VALUES ($1, $2, $3)
         ON CONFLICT (watchlist_id, symbol) DO NOTHING
         RETURNING *`,
        [watchlistId, symbol, market],
      );

      const row = result.rows[0];
      if (!row) throw new Error("Symbol already exists or insert failed");
      logger.info("Symbol added", { userId, symbol });
      return { symbol: row.symbol, market: row.market, addedAt: row.added_at };
    })(),
    WatchlistRepoError.handle,
  );

export const removeSymbol = (
  userId: string,
  symbol: string,
): ResultAsync<void, WatchlistRepoError> =>
  ResultAsync.fromPromise(
    (async () => {
      const watchlistId = await findOrCreateWatchlist(userId);
      await query(
        "DELETE FROM watchlist_items WHERE watchlist_id = $1 AND symbol = $2",
        [watchlistId, symbol],
      );
      logger.info("Symbol removed", { userId, symbol });
    })(),
    WatchlistRepoError.handle,
  );
