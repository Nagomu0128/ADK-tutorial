import { Hono } from "hono";
import { appLogger, type Market } from "@stock-advisor/shared";
import { getAuthUser } from "../middleware/auth.js";
import { findOrCreateUser } from "../infra/user-repo.js";
import { getWatchlist, addSymbol, removeSymbol } from "../infra/watchlist-repo.js";

export const watchlistRoutes = new Hono();
const logger = appLogger("orchestrator:watchlist");

// GET /v1/watchlist
watchlistRoutes.get("/", async (c) => {
  const authUser = getAuthUser(c);

  const userResult = await findOrCreateUser(authUser.uid, authUser.email);
  if (userResult.isErr()) {
    return c.json({ error: "Failed to resolve user" }, 500);
  }

  const result = await getWatchlist(userResult.value.id);

  return result.match(
    (watchlist) => c.json(watchlist),
    (error) => c.json({ error: error.message }, 500),
  );
});

// POST /v1/watchlist/symbols
watchlistRoutes.post("/symbols", async (c) => {
  const authUser = getAuthUser(c);
  const body = await c.req.json<{ symbol: string; market: Market }>();

  logger.info("Adding symbol", { uid: authUser.uid, symbol: body.symbol });

  const userResult = await findOrCreateUser(authUser.uid, authUser.email);
  if (userResult.isErr()) {
    return c.json({ error: "Failed to resolve user" }, 500);
  }

  const result = await addSymbol(userResult.value.id, body.symbol, body.market);

  return result.match(
    (item) => c.json({ success: true, ...item }, 201),
    (error) => c.json({ error: error.message }, 400),
  );
});

// DELETE /v1/watchlist/symbols/:symbol
watchlistRoutes.delete("/symbols/:symbol", async (c) => {
  const authUser = getAuthUser(c);
  const symbol = c.req.param("symbol");

  logger.info("Removing symbol", { uid: authUser.uid, symbol });

  const userResult = await findOrCreateUser(authUser.uid, authUser.email);
  if (userResult.isErr()) {
    return c.json({ error: "Failed to resolve user" }, 500);
  }

  const result = await removeSymbol(userResult.value.id, symbol);

  return result.match(
    () => c.json({ success: true, symbol }),
    (error) => c.json({ error: error.message }, 500),
  );
});
