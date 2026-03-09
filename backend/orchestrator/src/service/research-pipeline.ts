import { ResultAsync, okAsync } from "neverthrow";
import {
  sendA2ATask,
  createAgentRegistry,
  errorBuilder,
  type InferError,
  appLogger,
  type UserProfile,
  type NewsResult,
  type StockResult,
  type SentimentResult,
  type RiskAssessment,
  type PersonalizedReport,
  type AgentStatus,
  type AgentStatusValue,
} from "@stock-advisor/shared";

export const PipelineError = errorBuilder("PipelineError");
export type PipelineError = InferError<typeof PipelineError>;

const logger = appLogger("orchestrator:pipeline");
const registry = createAgentRegistry();

type ResearchInput = {
  readonly userId: string;
  readonly symbols: readonly string[];
  readonly date: string;
};

type ResearchOutput = {
  readonly profile: UserProfile;
  readonly news: readonly NewsResult[];
  readonly stocks: readonly StockResult[];
  readonly sentiments: readonly SentimentResult[];
  readonly riskAssessment: RiskAssessment;
  readonly report: PersonalizedReport;
  readonly agentStatuses: readonly AgentStatus[];
};

const createStatus = (
  agentName: string,
  status: AgentStatusValue,
  startedAt: string | null = null,
  completedAt: string | null = null,
): AgentStatus => ({ agentName, status, startedAt, completedAt });

export const runResearchPipeline = (
  input: ResearchInput,
): ResultAsync<ResearchOutput, PipelineError> => {
  logger.info("Starting research pipeline", { userId: input.userId, symbols: input.symbols });

  const statuses: AgentStatus[] = [
    createStatus("user-profile-agent", "pending"),
    createStatus("news-agent", "pending"),
    createStatus("stock-agent", "pending"),
    createStatus("sentiment-agent", "pending"),
    createStatus("risk-agent", "pending"),
    createStatus("report-agent", "pending"),
  ];

  // Step 1: Get user profile
  return sendA2ATask<{ profile: UserProfile; preferenceSummary: string }>(
    registry.userProfileAgent,
    { taskType: "get_user_profile", input: { userId: input.userId } },
  )
    .mapErr((e) => PipelineError(`User Profile Agent failed: ${e.message}`))
    .andThen(({ profile }) => {
      logger.info("User profile fetched", { style: profile.investmentStyle });

      // Step 2: Fetch news and stock data in parallel
      const newsTask = sendA2ATask<{ news: readonly NewsResult[] }>(
        registry.newsAgent,
        {
          taskType: "research_news",
          input: {
            symbols: input.symbols,
            date: input.date,
            interestedSectors: profile.interestedSectors,
            watchThemes: profile.watchThemes,
          },
        },
      ).mapErr((e) => PipelineError(`News Agent failed: ${e.message}`));

      const stockTask = sendA2ATask<{ stocks: readonly StockResult[] }>(
        registry.stockAgent,
        { taskType: "fetch_stock_data", input: { symbols: input.symbols } },
      ).mapErr((e) => PipelineError(`Stock Agent failed: ${e.message}`));

      return ResultAsync.combine([newsTask, stockTask]).andThen(
        ([newsResult, stockResult]) => {
          logger.info("News and stock data fetched", {
            newsCount: newsResult.news.length,
            stockCount: stockResult.stocks.length,
          });

          // Step 3: Sentiment and Risk in parallel
          const sentimentTask = sendA2ATask<{
            sentiments: readonly SentimentResult[];
            marketOverall: number;
          }>(registry.sentimentAgent, {
            taskType: "analyze_sentiment",
            input: { news: newsResult.news, stocks: stockResult.stocks },
          }).mapErr((e) => PipelineError(`Sentiment Agent failed: ${e.message}`));

          const riskTask = sendA2ATask<{ riskAssessment: RiskAssessment }>(
            registry.riskAgent,
            {
              taskType: "assess_risk",
              input: { stocks: stockResult.stocks, profile },
            },
          ).mapErr((e) => PipelineError(`Risk Agent failed: ${e.message}`));

          return ResultAsync.combine([sentimentTask, riskTask]).andThen(
            ([sentimentResult, riskResult]) => {
              logger.info("Sentiment and risk assessed");

              // Step 4: Generate personalized report
              return sendA2ATask<{ report: PersonalizedReport }>(
                registry.reportAgent,
                {
                  taskType: "generate_report",
                  input: {
                    news: newsResult.news,
                    stocks: stockResult.stocks,
                    sentiments: sentimentResult.sentiments,
                    riskAssessment: riskResult.riskAssessment,
                    profile,
                  },
                },
              )
                .mapErr((e) => PipelineError(`Report Agent failed: ${e.message}`))
                .map((reportResult) => {
                  logger.info("Research pipeline completed");

                  return {
                    profile,
                    news: newsResult.news,
                    stocks: stockResult.stocks,
                    sentiments: sentimentResult.sentiments,
                    riskAssessment: riskResult.riskAssessment,
                    report: reportResult.report,
                    agentStatuses: statuses.map((s) =>
                      createStatus(s.agentName, "completed", new Date().toISOString(), new Date().toISOString()),
                    ),
                  };
                });
            },
          );
        },
      );
    });
};
