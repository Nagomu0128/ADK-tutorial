import { ResultAsync } from "neverthrow";
import { errorBuilder, type InferError, appLogger, type PricePoint } from "@stock-advisor/shared";

export const AlphaVantageError = errorBuilder("AlphaVantageError");
export type AlphaVantageError = InferError<typeof AlphaVantageError>;

const logger = appLogger("stock-agent:alpha-vantage");

const API_KEY = process.env["ALPHA_VANTAGE_API_KEY"] ?? "demo";
const BASE_URL = "https://www.alphavantage.co/query";

type AlphaVantageDailyResponse = {
  readonly "Time Series (Daily)": Record<
    string,
    {
      readonly "1. open": string;
      readonly "2. high": string;
      readonly "3. low": string;
      readonly "4. close": string;
      readonly "5. volume": string;
    }
  >;
};

export type PriceData = {
  readonly latestClose: number;
  readonly changePercent: number;
  readonly history: readonly PricePoint[];
};

export const fetchAlphaVantageQuote = (
  symbol: string,
): ResultAsync<PriceData, AlphaVantageError> => {
  const url = `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}&outputsize=compact`;

  logger.info("Fetching from Alpha Vantage", { symbol });

  return ResultAsync.fromPromise(
    fetch(url).then(async (res) => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.json() as Promise<AlphaVantageDailyResponse>;
    }),
    AlphaVantageError.handle,
  ).map((data) => {
    const timeSeries = data["Time Series (Daily)"];
    const entries = Object.entries(timeSeries)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 30);

    const history: readonly PricePoint[] = entries.map(([date, values]) => ({
      date,
      close: parseFloat(values["4. close"]),
    }));

    const latestClose = history[0]?.close ?? 0;
    const previousClose = history[1]?.close ?? latestClose;
    const changePercent =
      previousClose !== 0
        ? ((latestClose - previousClose) / previousClose) * 100
        : 0;

    return { latestClose, changePercent, history };
  });
};
