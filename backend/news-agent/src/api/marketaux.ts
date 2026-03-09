import { ResultAsync } from "neverthrow";
import { errorBuilder, type InferError, appLogger } from "@stock-advisor/shared";
import type { RawNewsItem } from "./finnhub.js";

export const MarketAuxError = errorBuilder("MarketAuxError");
export type MarketAuxError = InferError<typeof MarketAuxError>;

const logger = appLogger("news-agent:marketaux");

const API_KEY = process.env["MARKETAUX_API_KEY"] ?? "";
const BASE_URL = "https://api.marketaux.com/v1";

type MarketAuxArticle = {
  readonly title: string;
  readonly description: string;
  readonly url: string;
  readonly source: string;
  readonly published_at: string;
  readonly entities: readonly { readonly symbol: string }[];
};

type MarketAuxResponse = {
  readonly data: readonly MarketAuxArticle[];
};

const toRawNewsItem = (article: MarketAuxArticle): RawNewsItem => ({
  headline: article.title,
  summary: article.description ?? "",
  url: article.url,
  source: article.source,
  datetime: new Date(article.published_at).getTime() / 1000,
  related: article.entities.map((e) => e.symbol).join(","),
  category: "marketaux",
});

export const fetchMarketAuxNews = (
  symbols: readonly string[],
): ResultAsync<readonly RawNewsItem[], MarketAuxError> => {
  const symbolParam = symbols.join(",");
  const url = `${BASE_URL}/news/all?symbols=${symbolParam}&filter_entities=true&language=en&api_token=${API_KEY}`;

  logger.info("Fetching news from MarketAux", { symbols: symbolParam });

  return ResultAsync.fromPromise(
    fetch(url).then(async (res) => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.json() as Promise<MarketAuxResponse>;
    }),
    MarketAuxError.handle,
  ).map((data) => data.data.map(toRawNewsItem));
};
