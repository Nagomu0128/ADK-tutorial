import { ResultAsync, okAsync } from "neverthrow";
import { errorBuilder, type InferError, appLogger, type NewsResult } from "@stock-advisor/shared";
import { fetchFinnhubNews, fetchFinnhubMarketNews, type RawNewsItem } from "./api/finnhub.js";
import { fetchMarketAuxNews } from "./api/marketaux.js";
import { summarizeNews } from "./domain/summarizer.js";

export const NewsResearchError = errorBuilder("NewsResearchError");
export type NewsResearchError = InferError<typeof NewsResearchError>;

const logger = appLogger("news-agent:handler");

type ResearchNewsInput = {
  readonly symbols: readonly string[];
  readonly date: string;
  readonly interestedSectors: readonly string[];
  readonly watchThemes: readonly string[];
};

const getDateRange = (date: string): { from: string; to: string } => {
  const d = new Date(date);
  const to = d.toISOString().split("T")[0]!;
  const from = new Date(d.getTime() - 3 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0]!;
  return { from, to };
};

const usSymbols = (symbols: readonly string[]): readonly string[] =>
  symbols.filter((s) => !s.includes(".T"));

const emptyNews = (): ResultAsync<readonly RawNewsItem[], never> =>
  okAsync([]);

const deduplicateNews = (
  items: readonly RawNewsItem[],
): readonly RawNewsItem[] =>
  items.reduce<readonly RawNewsItem[]>(
    (acc, item) =>
      acc.some((existing) => existing.headline === item.headline)
        ? acc
        : [...acc, item],
    [],
  );

export const handleResearchNews = (
  input: ResearchNewsInput,
): ResultAsync<{ news: readonly NewsResult[] }, NewsResearchError> => {
  logger.info("Starting news research", { symbols: input.symbols, date: input.date });

  const { from, to } = getDateRange(input.date);
  const usOnly = usSymbols(input.symbols);

  // Fetch from multiple sources with graceful degradation
  const companyNewsTask: ResultAsync<readonly RawNewsItem[], never> =
    usOnly.length > 0
      ? ResultAsync.combine(
          usOnly.slice(0, 5).map((symbol) => fetchFinnhubNews(symbol, from, to)),
        )
          .map((results) => results.flat())
          .orElse(() => emptyNews())
      : emptyNews();

  const marketNewsTask: ResultAsync<readonly RawNewsItem[], never> =
    fetchFinnhubMarketNews().orElse(() => emptyNews());

  const auxNewsTask: ResultAsync<readonly RawNewsItem[], never> =
    fetchMarketAuxNews(input.symbols).orElse(() => emptyNews());

  return ResultAsync.combine([companyNewsTask, marketNewsTask, auxNewsTask])
    .andThen(([companyNews, marketNews, auxNews]) => {
      const allNews = [...companyNews, ...marketNews, ...auxNews];
      const uniqueNews = deduplicateNews(allNews).slice(0, 20);

      return summarizeNews(uniqueNews, input.interestedSectors, input.watchThemes);
    })
    .map((summarized) => ({
      news: summarized.map((item) => ({
        id: crypto.randomUUID(),
        researchId: "",
        ...item,
      })),
    }))
    .mapErr((e) => NewsResearchError(`News research failed: ${e.message}`));
};
