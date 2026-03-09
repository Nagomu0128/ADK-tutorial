import { ResultAsync } from "neverthrow";
import { errorBuilder, type InferError, appLogger, type PricePoint } from "@stock-advisor/shared";
import type { PriceData } from "./alpha-vantage.js";

export const TwelveDataError = errorBuilder("TwelveDataError");
export type TwelveDataError = InferError<typeof TwelveDataError>;

const logger = appLogger("stock-agent:twelve-data");

const API_KEY = process.env["TWELVE_DATA_API_KEY"] ?? "";
const BASE_URL = "https://api.twelvedata.com";

type TwelveDataTimeSeriesResponse = {
  readonly values: readonly {
    readonly datetime: string;
    readonly open: string;
    readonly high: string;
    readonly low: string;
    readonly close: string;
    readonly volume: string;
  }[];
  readonly status: string;
};

export const fetchTwelveDataQuote = (
  symbol: string,
): ResultAsync<PriceData, TwelveDataError> => {
  const url = `${BASE_URL}/time_series?symbol=${symbol}&interval=1day&outputsize=30&apikey=${API_KEY}`;

  logger.info("Fetching from Twelve Data", { symbol });

  return ResultAsync.fromPromise(
    fetch(url).then(async (res) => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.json() as Promise<TwelveDataTimeSeriesResponse>;
    }),
    TwelveDataError.handle,
  ).map((data) => {
    const history: readonly PricePoint[] = data.values.map((v) => ({
      date: v.datetime,
      close: parseFloat(v.close),
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
