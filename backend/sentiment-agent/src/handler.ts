import { ResultAsync } from "neverthrow";
import {
  errorBuilder,
  type InferError,
  appLogger,
  type NewsResult,
  type StockResult,
  type SentimentResult,
  type SentimentLabel,
  runAgentForJson,
} from "@stock-advisor/shared";

export const SentimentError = errorBuilder("SentimentError");
export type SentimentError = InferError<typeof SentimentError>;

const logger = appLogger("sentiment-agent:handler");

type AnalyzeSentimentInput = {
  readonly news: readonly NewsResult[];
  readonly stocks: readonly StockResult[];
};

type SentimentOutput = {
  readonly sentiments: readonly SentimentResult[];
  readonly marketOverall: number;
};

type ParsedSentiment = {
  readonly symbols: readonly {
    readonly symbol: string;
    readonly sentimentScore: number;
    readonly divergenceSignal: string | null;
  }[];
  readonly marketOverall: number;
};

const scoreToLabel = (score: number): SentimentLabel => {
  if (score <= -0.6) return "very_bearish";
  if (score <= -0.2) return "bearish";
  if (score <= 0.2) return "neutral";
  if (score <= 0.6) return "bullish";
  return "very_bullish";
};

export const handleAnalyzeSentiment = (
  input: AnalyzeSentimentInput,
): ResultAsync<SentimentOutput, SentimentError> => {
  logger.info("Analyzing sentiment", {
    newsCount: input.news.length,
    stockCount: input.stocks.length,
  });

  if (input.stocks.length === 0) {
    return ResultAsync.fromSafePromise(
      Promise.resolve({ sentiments: [], marketOverall: 0 }),
    );
  }

  const newsContext = input.news
    .map((n) => `- [${n.impactLevel}] ${n.title}: ${n.summary} (related: ${n.relatedSymbols.join(", ")})`)
    .join("\n");

  const stockContext = input.stocks
    .map((s) => `- ${s.symbol}: price=${s.closingPrice}, change=${s.changePercent.toFixed(2)}%, trend=${s.trend}, RSI=${s.indicators.rsi14}`)
    .join("\n");

  return ResultAsync.fromPromise(
    runAgentForJson<ParsedSentiment>(
      {
        name: "sentiment_analyzer",
        description: "Analyzes market sentiment from news and stock data",
        instruction: `You are a market sentiment analyst. For each stock, provide sentimentScore (-1.0 to +1.0) and divergenceSignal (null or description).
Return JSON: { "symbols": [...], "marketOverall": number }. Respond ONLY with valid JSON.`,
      },
      `News:\n${newsContext}\n\nStock Data:\n${stockContext}`,
    ),
    SentimentError.handle,
  ).map((parsed) => ({
    sentiments: parsed.symbols.map((s) => ({
      id: crypto.randomUUID(),
      researchId: "",
      symbol: s.symbol,
      sentimentScore: s.sentimentScore,
      sentimentLabel: scoreToLabel(s.sentimentScore),
      divergenceSignal: s.divergenceSignal,
      marketOverallSentiment: parsed.marketOverall,
      analyzedAt: new Date().toISOString(),
    })),
    marketOverall: parsed.marketOverall,
  }));
};
