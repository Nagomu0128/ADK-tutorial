// === User & Profile ===

export type InvestmentStyle = "short_term" | "swing" | "long_term" | "dividend";
export type RiskTolerance = "conservative" | "balanced" | "aggressive";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type Market = "US" | "JP";

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

// === Research Results ===

export type AgentStatusValue = "pending" | "running" | "completed" | "failed";

export type AgentStatus = {
  readonly agentName: string;
  readonly status: AgentStatusValue;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
};

export type ImpactLevel = "high" | "medium" | "low";

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

export type TechIndicators = {
  readonly sma20: number;
  readonly sma50: number;
  readonly rsi14: number;
  readonly macd: {
    readonly line: number;
    readonly signal: number;
    readonly histogram: number;
  };
  readonly bollingerBands: {
    readonly upper: number;
    readonly middle: number;
    readonly lower: number;
  };
};

export type Trend = "bullish" | "bearish" | "neutral";

export type PricePoint = {
  readonly date: string;
  readonly close: number;
};

export type StockResult = {
  readonly id: string;
  readonly researchId: string;
  readonly symbol: string;
  readonly closingPrice: number;
  readonly changePercent: number;
  readonly trend: Trend;
  readonly indicators: TechIndicators;
  readonly priceHistory: readonly PricePoint[];
  readonly fetchedAt: string;
};

export type SentimentLabel = "very_bearish" | "bearish" | "neutral" | "bullish" | "very_bullish";

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

export type RiskAssessment = {
  readonly id: string;
  readonly researchId: string;
  readonly overallRiskScore: number;
  readonly sectorConcentration: readonly { readonly sector: string; readonly ratio: number }[];
  readonly volatilityRanks: readonly { readonly symbol: string; readonly volatility: number; readonly rank: number }[];
  readonly riskToleranceAlignment: "aligned" | "over_risk" | "under_risk";
  readonly warnings: readonly string[];
  readonly assessedAt: string;
};

export type SuggestionAction = "buy" | "hold" | "skip";

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

export type ReportTone = "beginner_friendly" | "technical" | "concise";

export type PersonalizedReport = {
  readonly id: string;
  readonly researchId: string;
  readonly summary: string;
  readonly suggestions: readonly InvestmentSuggestion[];
  readonly riskNotes: string;
  readonly generatedAt: string;
  readonly tone: ReportTone;
};

export type ResearchStatus = "pending" | "in_progress" | "completed" | "failed";

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

// === A2A Task Types ===

export type A2ATaskInput =
  | { readonly type: "get_user_profile"; readonly userId: string }
  | { readonly type: "research_news"; readonly symbols: readonly string[]; readonly date: string; readonly interestedSectors: readonly string[]; readonly watchThemes: readonly string[] }
  | { readonly type: "fetch_stock_data"; readonly symbols: readonly string[] }
  | { readonly type: "analyze_sentiment"; readonly news: readonly NewsResult[]; readonly stocks: readonly StockResult[] }
  | { readonly type: "assess_risk"; readonly stocks: readonly StockResult[]; readonly profile: UserProfile }
  | { readonly type: "generate_report"; readonly news: readonly NewsResult[]; readonly stocks: readonly StockResult[]; readonly sentiments: readonly SentimentResult[]; readonly riskAssessment: RiskAssessment; readonly profile: UserProfile };

// === Feedback ===

export type UserFeedback = {
  readonly id: string;
  readonly userId: string;
  readonly suggestionId: string;
  readonly helpful: boolean;
  readonly createdAt: string;
};
