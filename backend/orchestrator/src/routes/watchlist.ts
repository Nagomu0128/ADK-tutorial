import { Hono } from "hono";
import { appLogger } from "@stock-advisor/shared";

export const watchlistRoutes = new Hono();
const logger = appLogger("orchestrator:watchlist");

// GET /v1/watchlist - Get user's watchlist
watchlistRoutes.get("/", async (c) => {
  // TODO: Get userId from Firebase Auth, fetch from DB
  logger.info("Fetching watchlist");
  return c.json({
    id: "demo-watchlist",
    userId: "demo-user",
    symbols: [
      { symbol: "AAPL", market: "US", addedAt: new Date().toISOString() },
      { symbol: "GOOGL", market: "US", addedAt: new Date().toISOString() },
      { symbol: "7203.T", market: "JP", addedAt: new Date().toISOString() },
    ],
  });
});

// POST /v1/watchlist/symbols - Add symbol
watchlistRoutes.post("/symbols", async (c) => {
  const body = await c.req.json<{ symbol: string; market: "US" | "JP" }>();
  logger.info("Adding symbol to watchlist", { symbol: body.symbol });
  // TODO: Save to DB
  return c.json({ success: true, symbol: body.symbol, market: body.market }, 201);
});

// DELETE /v1/watchlist/symbols/:symbol - Remove symbol
watchlistRoutes.delete("/symbols/:symbol", async (c) => {
  const symbol = c.req.param("symbol");
  logger.info("Removing symbol from watchlist", { symbol });
  // TODO: Remove from DB
  return c.json({ success: true, symbol });
});
