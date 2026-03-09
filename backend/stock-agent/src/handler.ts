import { ResultAsync, ok, err } from "neverthrow";
import { match } from "ts-pattern";
import { errorBuilder, type InferError, appLogger, type StockResult } from "@stock-advisor/shared";
import { fetchAlphaVantageQuote } from "./api/alpha-vantage.js";
import { fetchTwelveDataQuote } from "./api/twelve-data.js";
import { calculateIndicators } from "./domain/indicators.js";
import { determineTrend } from "./domain/trend.js";

export const StockFetchError = errorBuilder("StockFetchError");
export type StockFetchError = InferError<typeof StockFetchError>;

type FetchStockInput = {
  readonly symbols: readonly string[];
};

const logger = appLogger("stock-agent:handler");

const detectMarket = (symbol: string): "US" | "JP" =>
  symbol.includes(".T") ? "JP" : "US";

const fetchSingleStock = (
  symbol: string,
  researchId: string,
): ResultAsync<StockResult, StockFetchError> => {
  const market = detectMarket(symbol);

  return match(market)
    .with("US", () => fetchAlphaVantageQuote(symbol))
    .with("JP", () => fetchTwelveDataQuote(symbol))
    .exhaustive()
    .map((priceData) => {
      const indicators = calculateIndicators(priceData.history);
      const trend = determineTrend(priceData.history, indicators);

      return {
        id: crypto.randomUUID(),
        researchId,
        symbol,
        closingPrice: priceData.latestClose,
        changePercent: priceData.changePercent,
        trend,
        indicators,
        priceHistory: priceData.history,
        fetchedAt: new Date().toISOString(),
      };
    })
    .mapErr((e) => StockFetchError(`Failed to fetch ${symbol}: ${e.message}`));
};

export const handleFetchStockData = (
  input: FetchStockInput,
): ResultAsync<{ stocks: readonly StockResult[] }, StockFetchError> => {
  logger.info("Fetching stock data", { symbols: input.symbols });

  const researchId = crypto.randomUUID();

  return ResultAsync.combine(
    input.symbols.map((symbol) => fetchSingleStock(symbol, researchId)),
  ).map((stocks) => ({ stocks }));
};
