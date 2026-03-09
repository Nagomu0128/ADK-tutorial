import { ResultAsync } from "neverthrow";
import {
  query,
  errorBuilder,
  type InferError,
  appLogger,
  type DailyResearch,
  type ResearchStatus,
  type NewsResult,
  type StockResult,
  type SentimentResult,
  type RiskAssessment,
  type PersonalizedReport,
  type InvestmentSuggestion,
  type AgentStatus,
} from "@stock-advisor/shared";

export const ResearchRepoError = errorBuilder("ResearchRepoError");
export type ResearchRepoError = InferError<typeof ResearchRepoError>;

const logger = appLogger("orchestrator:research-repo");

type ResearchRow = {
  readonly id: string;
  readonly user_id: string;
  readonly research_date: string;
  readonly status: ResearchStatus;
  readonly agent_statuses: readonly AgentStatus[];
  readonly created_at: string;
};

export const createResearch = (
  userId: string,
  date: string,
): ResultAsync<string, ResearchRepoError> =>
  ResultAsync.fromPromise(
    query<ResearchRow>(
      `INSERT INTO daily_research (user_id, research_date, status)
       VALUES ($1, $2, 'in_progress')
       ON CONFLICT (user_id, research_date) DO UPDATE SET status = 'in_progress', agent_statuses = '[]'
       RETURNING id`,
      [userId, date],
    ).then((result) => {
      const row = result.rows[0];
      if (!row) throw new Error("Failed to create research");
      logger.info("Research created", { userId, date, id: row.id });
      return row.id;
    }),
    ResearchRepoError.handle,
  );

export const updateResearchStatus = (
  researchId: string,
  status: ResearchStatus,
  agentStatuses: readonly AgentStatus[],
): ResultAsync<void, ResearchRepoError> =>
  ResultAsync.fromPromise(
    query(
      "UPDATE daily_research SET status = $1, agent_statuses = $2 WHERE id = $3",
      [status, JSON.stringify(agentStatuses), researchId],
    ).then(() => {
      logger.info("Research status updated", { researchId, status });
    }),
    ResearchRepoError.handle,
  );

export const saveNewsResults = (
  researchId: string,
  news: readonly NewsResult[],
): ResultAsync<void, ResearchRepoError> =>
  ResultAsync.fromPromise(
    Promise.all(
      news.map((n) =>
        query(
          `INSERT INTO news_results (id, research_id, title, summary, source_url, related_symbols, impact_level, relevance_score, published_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [n.id, researchId, n.title, n.summary, n.sourceUrl, n.relatedSymbols, n.impactLevel, n.relevanceScore, n.publishedAt],
        ),
      ),
    ).then(() => {
      logger.info("News results saved", { researchId, count: news.length });
    }),
    ResearchRepoError.handle,
  );

export const saveStockResults = (
  researchId: string,
  stocks: readonly StockResult[],
): ResultAsync<void, ResearchRepoError> =>
  ResultAsync.fromPromise(
    Promise.all(
      stocks.map((s) =>
        query(
          `INSERT INTO stock_results (id, research_id, symbol, closing_price, change_percent, trend, indicators, price_history, fetched_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [s.id, researchId, s.symbol, s.closingPrice, s.changePercent, s.trend, JSON.stringify(s.indicators), JSON.stringify(s.priceHistory), s.fetchedAt],
        ),
      ),
    ).then(() => {
      logger.info("Stock results saved", { researchId, count: stocks.length });
    }),
    ResearchRepoError.handle,
  );

export const saveSentimentResults = (
  researchId: string,
  sentiments: readonly SentimentResult[],
): ResultAsync<void, ResearchRepoError> =>
  ResultAsync.fromPromise(
    Promise.all(
      sentiments.map((s) =>
        query(
          `INSERT INTO sentiment_results (id, research_id, symbol, sentiment_score, sentiment_label, divergence_signal, market_overall_sentiment)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [s.id, researchId, s.symbol, s.sentimentScore, s.sentimentLabel, s.divergenceSignal, s.marketOverallSentiment],
        ),
      ),
    ).then(() => {
      logger.info("Sentiment results saved", { researchId, count: sentiments.length });
    }),
    ResearchRepoError.handle,
  );

export const saveRiskAssessment = (
  researchId: string,
  risk: RiskAssessment,
): ResultAsync<void, ResearchRepoError> =>
  ResultAsync.fromPromise(
    query(
      `INSERT INTO risk_assessments (id, research_id, overall_risk_score, sector_concentration, volatility_ranks, risk_tolerance_alignment, warnings)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [risk.id, researchId, risk.overallRiskScore, JSON.stringify(risk.sectorConcentration), JSON.stringify(risk.volatilityRanks), risk.riskToleranceAlignment, risk.warnings],
    ).then(() => {
      logger.info("Risk assessment saved", { researchId });
    }),
    ResearchRepoError.handle,
  );

export const saveReport = (
  researchId: string,
  report: PersonalizedReport,
): ResultAsync<void, ResearchRepoError> =>
  ResultAsync.fromPromise(
    (async () => {
      await query(
        `INSERT INTO personalized_reports (id, research_id, summary, risk_notes, tone)
         VALUES ($1, $2, $3, $4, $5)`,
        [report.id, researchId, report.summary, report.riskNotes, report.tone],
      );

      await Promise.all(
        report.suggestions.map((s) =>
          query(
            `INSERT INTO investment_suggestions (id, report_id, symbol, action, confidence, reasoning, referenced_news_ids, sentiment_basis, risk_basis)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [s.id, s.reportId, s.symbol, s.action, s.confidence, s.reasoning, s.referencedNewsIds, s.sentimentBasis, s.riskBasis],
          ),
        ),
      );

      logger.info("Report saved", { researchId, suggestions: report.suggestions.length });
    })(),
    ResearchRepoError.handle,
  );

export const getResearchById = (
  researchId: string,
): ResultAsync<DailyResearch | null, ResearchRepoError> =>
  ResultAsync.fromPromise(
    (async () => {
      const research = await query<ResearchRow>(
        "SELECT * FROM daily_research WHERE id = $1",
        [researchId],
      );
      const row = research.rows[0];
      if (!row) return null;

      const [newsRes, stockRes, sentimentRes, riskRes, reportRes] = await Promise.all([
        query<NewsResult>("SELECT * FROM news_results WHERE research_id = $1", [researchId]),
        query<StockResult>("SELECT * FROM stock_results WHERE research_id = $1", [researchId]),
        query<SentimentResult>("SELECT * FROM sentiment_results WHERE research_id = $1", [researchId]),
        query<RiskAssessment>("SELECT * FROM risk_assessments WHERE research_id = $1", [researchId]),
        query<PersonalizedReport & { suggestions?: readonly InvestmentSuggestion[] }>(
          "SELECT * FROM personalized_reports WHERE research_id = $1", [researchId],
        ),
      ]);

      const report = reportRes.rows[0] ?? null;
      const suggestions = report
        ? await query<InvestmentSuggestion>(
            "SELECT * FROM investment_suggestions WHERE report_id = $1",
            [report.id],
          )
        : { rows: [] };

      return {
        id: row.id,
        userId: row.user_id,
        date: row.research_date,
        status: row.status,
        agentStatuses: row.agent_statuses,
        newsResults: newsRes.rows,
        stockResults: stockRes.rows,
        sentimentResults: sentimentRes.rows,
        riskAssessment: riskRes.rows[0] ?? null,
        report: report
          ? { ...report, suggestions: suggestions.rows }
          : null,
        createdAt: row.created_at,
      };
    })(),
    ResearchRepoError.handle,
  );

export const getResearchHistory = (
  userId: string,
): ResultAsync<readonly { id: string; date: string; status: ResearchStatus; createdAt: string }[], ResearchRepoError> =>
  ResultAsync.fromPromise(
    query<{ id: string; research_date: string; status: ResearchStatus; created_at: string }>(
      "SELECT id, research_date, status, created_at FROM daily_research WHERE user_id = $1 ORDER BY research_date DESC LIMIT 7",
      [userId],
    ).then((result) =>
      result.rows.map((r) => ({
        id: r.id,
        date: r.research_date,
        status: r.status,
        createdAt: r.created_at,
      })),
    ),
    ResearchRepoError.handle,
  );

export const deleteOldResearch = (): ResultAsync<number, ResearchRepoError> =>
  ResultAsync.fromPromise(
    query(
      "DELETE FROM daily_research WHERE research_date < CURRENT_DATE - INTERVAL '7 days'",
    ).then((result) => {
      logger.info("Old research deleted", { count: result.rowCount });
      return result.rowCount;
    }),
    ResearchRepoError.handle,
  );
