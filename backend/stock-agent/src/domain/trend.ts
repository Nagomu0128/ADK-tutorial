import type { PricePoint, TechIndicators, Trend } from "@stock-advisor/shared";

export const determineTrend = (
  priceHistory: readonly PricePoint[],
  indicators: TechIndicators,
): Trend => {
  const latestPrice = priceHistory[0]?.close ?? 0;

  // Bullish signals
  const aboveSMA20 = latestPrice > indicators.sma20;
  const aboveSMA50 = latestPrice > indicators.sma50;
  const rsiNotOverbought = indicators.rsi14 < 70;
  const rsiNotOversold = indicators.rsi14 > 30;
  const macdPositive = indicators.macd.histogram > 0;

  const bullishSignals = [aboveSMA20, aboveSMA50, macdPositive].filter(Boolean).length;
  const bearishSignals = [!aboveSMA20, !aboveSMA50, !macdPositive].filter(Boolean).length;

  if (bullishSignals >= 2 && rsiNotOverbought) return "bullish";
  if (bearishSignals >= 2 && rsiNotOversold) return "bearish";
  return "neutral";
};
