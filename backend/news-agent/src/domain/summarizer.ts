import { ResultAsync } from "neverthrow";
import { errorBuilder, type InferError, appLogger, type ImpactLevel, runAgentForJson } from "@stock-advisor/shared";
import type { RawNewsItem } from "../api/finnhub.js";

export const SummarizerError = errorBuilder("SummarizerError");
export type SummarizerError = InferError<typeof SummarizerError>;

const logger = appLogger("news-agent:summarizer");

export type SummarizedNews = {
  readonly title: string;
  readonly summary: string;
  readonly sourceUrl: string;
  readonly relatedSymbols: readonly string[];
  readonly impactLevel: ImpactLevel;
  readonly relevanceScore: number;
  readonly publishedAt: string;
};

type ParsedSummary = {
  readonly title: string;
  readonly summary: string;
  readonly relatedSymbols: string[];
  readonly impactLevel: ImpactLevel;
  readonly relevanceScore: number;
};

export const summarizeNews = (
  newsItems: readonly RawNewsItem[],
  interestedSectors: readonly string[],
  watchThemes: readonly string[],
): ResultAsync<readonly SummarizedNews[], SummarizerError> => {
  if (newsItems.length === 0) {
    return ResultAsync.fromSafePromise(Promise.resolve([]));
  }

  logger.info("Summarizing news with ADK LlmAgent", { count: newsItems.length });

  const newsData = newsItems
    .map((n, i) => `${i + 1}. ${n.headline}\n   ${n.summary}`)
    .join("\n\n");

  return ResultAsync.fromPromise(
    runAgentForJson<readonly ParsedSummary[]>(
      {
        name: "news_summarizer",
        description: "Summarizes and classifies financial news articles",
        instruction: `You are a financial news analyst. Analyze news articles and return a JSON array.
For each article provide: title, summary (1-2 sentences in Japanese), relatedSymbols (ticker array), impactLevel ("high"/"medium"/"low"), relevanceScore (0.0-1.0 based on sectors: [${interestedSectors.join(", ")}] and themes: [${watchThemes.join(", ")}]).
Respond ONLY with a valid JSON array.`,
      },
      `Analyze these news articles:\n${newsData}`,
    ),
    SummarizerError.handle,
  ).map((parsed) =>
    parsed.map((item, i) => ({
      title: item.title,
      summary: item.summary,
      sourceUrl: newsItems[i]?.url ?? "",
      relatedSymbols: item.relatedSymbols,
      impactLevel: item.impactLevel,
      relevanceScore: item.relevanceScore,
      publishedAt: newsItems[i]
        ? new Date(newsItems[i].datetime * 1000).toISOString()
        : new Date().toISOString(),
    })),
  );
};
