import { ResultAsync } from "neverthrow";
import { match } from "ts-pattern";
import {
  errorBuilder,
  type InferError,
  appLogger,
  type StockResult,
  type UserProfile,
  type RiskAssessment,
  runAgentForJson,
} from "@stock-advisor/shared";

export const RiskError = errorBuilder("RiskError");
export type RiskError = InferError<typeof RiskError>;

const logger = appLogger("risk-agent:handler");

type AssessRiskInput = {
  readonly stocks: readonly StockResult[];
  readonly profile: UserProfile;
};

const calculateVolatility = (stock: StockResult): number => {
  const prices = stock.priceHistory.map((p) => p.close);
  if (prices.length < 2) return 0;

  const returns = prices.slice(0, -1).map((p, i) => (prices[i + 1]! - p) / p);
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / returns.length;
  return Math.sqrt(variance) * Math.sqrt(252) * 100;
};

const detectSectorFromSymbol = (symbol: string): string => {
  const sectorMap: Record<string, string> = {
    AAPL: "technology", GOOGL: "technology", MSFT: "technology", NVDA: "technology",
    AMZN: "consumer", TSLA: "automotive", JPM: "finance", JNJ: "healthcare",
  };
  return sectorMap[symbol.replace(".T", "")] ?? "other";
};

const determineAlignment = (
  riskScore: number,
  tolerance: UserProfile["riskTolerance"],
): "aligned" | "over_risk" | "under_risk" => {
  const thresholds = match(tolerance)
    .with("conservative", () => ({ max: 40 }))
    .with("balanced", () => ({ max: 60 }))
    .with("aggressive", () => ({ max: 85 }))
    .exhaustive();

  if (riskScore > thresholds.max) return "over_risk";
  if (riskScore < thresholds.max * 0.3) return "under_risk";
  return "aligned";
};

export const handleAssessRisk = (
  input: AssessRiskInput,
): ResultAsync<{ riskAssessment: RiskAssessment }, RiskError> => {
  logger.info("Assessing risk", { stockCount: input.stocks.length });

  const volatilities = input.stocks.map((stock) => ({
    symbol: stock.symbol,
    volatility: Math.round(calculateVolatility(stock) * 100) / 100,
  }));

  const sortedByVol = [...volatilities].sort((a, b) => b.volatility - a.volatility);
  const volatilityRanks = sortedByVol.map((v, i) => ({ ...v, rank: i + 1 }));

  const sectors = input.stocks.map((s) => detectSectorFromSymbol(s.symbol));
  const sectorCounts = sectors.reduce<Record<string, number>>(
    (acc, s) => ({ ...acc, [s]: (acc[s] ?? 0) + 1 }),
    {},
  );
  const total = sectors.length;
  const sectorConcentration = Object.entries(sectorCounts).map(([sector, count]) => ({
    sector,
    ratio: Math.round((count / total) * 100) / 100,
  }));

  const avgVolatility = volatilities.reduce((sum, v) => sum + v.volatility, 0) / (volatilities.length || 1);
  const maxConcentration = Math.max(...sectorConcentration.map((s) => s.ratio), 0);
  const rsiExtremes = input.stocks.filter(
    (s) => s.indicators.rsi14 > 70 || s.indicators.rsi14 < 30,
  ).length / (input.stocks.length || 1);

  const overallRiskScore = Math.min(
    100,
    Math.round(avgVolatility * 0.5 + maxConcentration * 100 * 0.3 + rsiExtremes * 100 * 0.2),
  );

  const alignment = determineAlignment(overallRiskScore, input.profile.riskTolerance);

  return ResultAsync.fromPromise(
    runAgentForJson<readonly string[]>(
      {
        name: "risk_warning_generator",
        description: "Generates risk warnings in Japanese",
        instruction: `Generate 1-3 concise warning messages in Japanese based on portfolio risk analysis. Return a JSON array of warning strings. Respond ONLY with valid JSON.`,
      },
      `Risk score: ${overallRiskScore}/100, Tolerance: ${input.profile.riskTolerance}, Alignment: ${alignment}, Sectors: ${sectorConcentration.map((s) => `${s.sector}:${(s.ratio * 100).toFixed(0)}%`).join(",")}, High vol: ${sortedByVol.slice(0, 3).map((v) => `${v.symbol}(${v.volatility.toFixed(1)}%)`).join(",")}, RSI extremes: ${input.stocks.filter((s) => s.indicators.rsi14 > 70 || s.indicators.rsi14 < 30).map((s) => `${s.symbol}(${s.indicators.rsi14})`).join(",") || "none"}`,
    ),
    RiskError.handle,
  ).map((warnings) => ({
    riskAssessment: {
      id: crypto.randomUUID(),
      researchId: "",
      overallRiskScore,
      sectorConcentration,
      volatilityRanks,
      riskToleranceAlignment: alignment,
      warnings,
      assessedAt: new Date().toISOString(),
    },
  }));
};
