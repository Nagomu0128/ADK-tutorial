import { ResultAsync } from "neverthrow";
import { errorBuilder, type InferError, appLogger } from "@stock-advisor/shared";

export const FinnhubError = errorBuilder("FinnhubError");
export type FinnhubError = InferError<typeof FinnhubError>;

const logger = appLogger("news-agent:finnhub");

const API_KEY = process.env["FINNHUB_API_KEY"] ?? "";
const BASE_URL = "https://finnhub.io/api/v1";

export type RawNewsItem = {
  readonly headline: string;
  readonly summary: string;
  readonly url: string;
  readonly source: string;
  readonly datetime: number;
  readonly related: string;
  readonly category: string;
};

export const fetchFinnhubNews = (
  symbol: string,
  fromDate: string,
  toDate: string,
): ResultAsync<readonly RawNewsItem[], FinnhubError> => {
  const url = `${BASE_URL}/company-news?symbol=${symbol}&from=${fromDate}&to=${toDate}&token=${API_KEY}`;

  logger.info("Fetching news from Finnhub", { symbol, fromDate, toDate });

  return ResultAsync.fromPromise(
    fetch(url).then(async (res) => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.json() as Promise<readonly RawNewsItem[]>;
    }),
    FinnhubError.handle,
  );
};

export const fetchFinnhubMarketNews = (): ResultAsync<readonly RawNewsItem[], FinnhubError> => {
  const url = `${BASE_URL}/news?category=general&token=${API_KEY}`;

  logger.info("Fetching market news from Finnhub");

  return ResultAsync.fromPromise(
    fetch(url).then(async (res) => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.json() as Promise<readonly RawNewsItem[]>;
    }),
    FinnhubError.handle,
  );
};
