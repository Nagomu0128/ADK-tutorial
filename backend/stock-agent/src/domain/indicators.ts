import type { PricePoint, TechIndicators } from "@stock-advisor/shared";

const average = (values: readonly number[]): number =>
  values.length === 0 ? 0 : values.reduce((sum, v) => sum + v, 0) / values.length;

const calculateSMA = (prices: readonly number[], period: number): number =>
  average(prices.slice(0, period));

const calculateRSI = (prices: readonly number[], period: number = 14): number => {
  if (prices.length < period + 1) return 50; // default neutral

  const changes = prices.slice(0, period + 1).reduce<readonly number[]>(
    (acc, price, i, arr) => (i === 0 ? acc : [...acc, arr[i - 1]! - price]),
    [],
  );

  const gains = changes.filter((c) => c > 0);
  const losses = changes.filter((c) => c < 0).map((c) => Math.abs(c));

  const avgGain = gains.length > 0 ? average(gains) : 0;
  const avgLoss = losses.length > 0 ? average(losses) : 0;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
};

const calculateMACD = (
  prices: readonly number[],
): { line: number; signal: number; histogram: number } => {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdLine = ema12 - ema26;
  // Simplified: signal as 9-period approximation
  const signal = macdLine * 0.8;
  return { line: macdLine, signal, histogram: macdLine - signal };
};

const calculateEMA = (prices: readonly number[], period: number): number => {
  if (prices.length === 0) return 0;
  const multiplier = 2 / (period + 1);
  return prices.slice(0, period).reduce(
    (ema, price) => price * multiplier + ema * (1 - multiplier),
    prices[0]!,
  );
};

const calculateBollingerBands = (
  prices: readonly number[],
  period: number = 20,
): { upper: number; middle: number; lower: number } => {
  const slice = prices.slice(0, period);
  const middle = average(slice);
  const variance = average(slice.map((p) => (p - middle) ** 2));
  const stdDev = Math.sqrt(variance);

  return {
    upper: Math.round((middle + 2 * stdDev) * 100) / 100,
    middle: Math.round(middle * 100) / 100,
    lower: Math.round((middle - 2 * stdDev) * 100) / 100,
  };
};

export const calculateIndicators = (
  priceHistory: readonly PricePoint[],
): TechIndicators => {
  // Price history is ordered newest first
  const prices = priceHistory.map((p) => p.close);

  return {
    sma20: Math.round(calculateSMA(prices, 20) * 100) / 100,
    sma50: Math.round(calculateSMA(prices, Math.min(50, prices.length)) * 100) / 100,
    rsi14: Math.round(calculateRSI(prices) * 100) / 100,
    macd: calculateMACD(prices),
    bollingerBands: calculateBollingerBands(prices),
  };
};
