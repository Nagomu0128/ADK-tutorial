// ===== Data Model Types =====
// Based on requirements.md Section 5

export type InvestmentStyle = "short_term" | "swing" | "long_term" | "dividend";
export type RiskTolerance = "conservative" | "balanced" | "aggressive";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type Market = "US" | "JP";
export type ImpactLevel = "high" | "medium" | "low";
export type SentimentLabel = "very_bearish" | "bearish" | "neutral" | "bullish" | "very_bullish";
export type Trend = "bullish" | "bearish" | "neutral";
export type ResearchStatus = "pending" | "in_progress" | "completed" | "failed";
export type AgentRunStatus = "pending" | "running" | "completed" | "failed";
export type SuggestionAction = "buy" | "hold" | "skip";
export type RiskAlignment = "aligned" | "over_risk" | "under_risk";
export type ReportTone = "beginner_friendly" | "technical" | "concise";

export type User = {
  readonly id: string;
  readonly email: string;
  readonly createdAt: string;
};

export type UserProfile = {
  readonly id: string;
  readonly userId: string;
  readonly investmentStyle: InvestmentStyle;
  readonly riskTolerance: RiskTolerance;
  readonly experienceLevel: ExperienceLevel;
  readonly interestedSectors: readonly string[];
  readonly watchThemes: readonly string[];
  readonly preferenceModel: Record<string, unknown>;
  readonly updatedAt: string;
};

export type WatchlistItem = {
  readonly symbol: string;
  readonly market: Market;
  readonly addedAt: string;
};

export type Watchlist = {
  readonly id: string;
  readonly userId: string;
  readonly symbols: readonly WatchlistItem[];
};

export type AgentStatus = {
  readonly agentName: string;
  readonly status: AgentRunStatus;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
};

export type NewsResult = {
  readonly id: string;
  readonly researchId: string;
  readonly title: string;
  readonly summary: string;
  readonly sourceUrl: string;
  readonly relatedSymbols: readonly string[];
  readonly impactLevel: ImpactLevel;
  readonly relevanceScore: number;
  readonly publishedAt: string;
};

export type PriceHistoryPoint = {
  readonly date: string;
  readonly close: number;
};

export type MACD = {
  readonly line: number;
  readonly signal: number;
  readonly histogram: number;
};

export type BollingerBands = {
  readonly upper: number;
  readonly middle: number;
  readonly lower: number;
};

export type StockResult = {
  readonly id: string;
  readonly researchId: string;
  readonly symbol: string;
  readonly closingPrice: number;
  readonly changePercent: number;
  readonly sma20: number;
  readonly sma50: number;
  readonly rsi14: number;
  readonly macd: MACD;
  readonly bollingerBands: BollingerBands;
  readonly trend: Trend;
  readonly priceHistory: readonly PriceHistoryPoint[];
  readonly fetchedAt: string;
};

export type SentimentResult = {
  readonly id: string;
  readonly researchId: string;
  readonly symbol: string;
  readonly sentimentScore: number;
  readonly sentimentLabel: SentimentLabel;
  readonly divergenceSignal: string | null;
  readonly marketOverallSentiment: number;
  readonly analyzedAt: string;
};

export type SectorConcentration = {
  readonly sector: string;
  readonly ratio: number;
};

export type VolatilityRank = {
  readonly symbol: string;
  readonly volatility: number;
  readonly rank: number;
};

export type RiskAssessment = {
  readonly id: string;
  readonly researchId: string;
  readonly overallRiskScore: number;
  readonly sectorConcentration: readonly SectorConcentration[];
  readonly volatilityRanks: readonly VolatilityRank[];
  readonly riskToleranceAlignment: RiskAlignment;
  readonly warnings: readonly string[];
  readonly assessedAt: string;
};

export type InvestmentSuggestion = {
  readonly id: string;
  readonly reportId: string;
  readonly symbol: string;
  readonly action: SuggestionAction;
  readonly confidence: number;
  readonly reasoning: string;
  readonly referencedNewsIds: readonly string[];
  readonly sentimentBasis: string;
  readonly riskBasis: string;
  readonly createdAt: string;
};

export type PersonalizedReport = {
  readonly id: string;
  readonly researchId: string;
  readonly summary: string;
  readonly suggestions: readonly InvestmentSuggestion[];
  readonly riskNotes: string;
  readonly generatedAt: string;
  readonly tone: ReportTone;
};

export type DailyResearch = {
  readonly id: string;
  readonly userId: string;
  readonly date: string;
  readonly status: ResearchStatus;
  readonly agentStatuses: readonly AgentStatus[];
  readonly newsResults: readonly NewsResult[];
  readonly stockResults: readonly StockResult[];
  readonly sentimentResults: readonly SentimentResult[];
  readonly riskAssessment: RiskAssessment | null;
  readonly report: PersonalizedReport | null;
  readonly createdAt: string;
};

export type UserFeedback = {
  readonly id: string;
  readonly userId: string;
  readonly suggestionId: string;
  readonly helpful: boolean;
  readonly createdAt: string;
};

// API request/response types
export type AddSymbolRequest = {
  readonly symbol: string;
  readonly market: Market;
};

export type UpdateProfileRequest = {
  readonly investmentStyle: InvestmentStyle;
  readonly riskTolerance: RiskTolerance;
  readonly experienceLevel: ExperienceLevel;
  readonly interestedSectors: readonly string[];
  readonly watchThemes: readonly string[];
};

export type FeedbackRequest = {
  readonly suggestionId: string;
  readonly helpful: boolean;
};

export type ResearchHistoryItem = {
  readonly id: string;
  readonly date: string;
  readonly status: ResearchStatus;
  readonly createdAt: string;
};
