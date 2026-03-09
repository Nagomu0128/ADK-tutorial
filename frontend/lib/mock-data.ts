import type {
  AgentStatus,
  DailyResearch,
  InvestmentSuggestion,
  NewsResult,
  PersonalizedReport,
  RiskAssessment,
  SentimentResult,
  StockResult,
  UserProfile,
  Watchlist,
  WatchlistItem,
  ResearchHistoryItem,
} from "./types";

// ===== Helper: generate price history =====
const generatePriceHistory = (
  basePrice: number,
  days: number,
  volatility: number
): readonly { date: string; close: number }[] =>
  Array.from({ length: days }, (_, i) => {
    const date = new Date(2026, 2, 10 - (days - 1 - i));
    const randomChange = (Math.random() - 0.48) * volatility;
    return {
      date: date.toISOString().split("T")[0],
      close: Math.round((basePrice + randomChange * (i + 1)) * 100) / 100,
    };
  });

// ===== Agent Statuses =====
export const mockAgentStatuses: readonly AgentStatus[] = [
  { agentName: "User Profile", status: "completed", startedAt: "2026-03-10T09:00:00Z", completedAt: "2026-03-10T09:00:02Z" },
  { agentName: "News", status: "completed", startedAt: "2026-03-10T09:00:02Z", completedAt: "2026-03-10T09:00:08Z" },
  { agentName: "Stock", status: "completed", startedAt: "2026-03-10T09:00:02Z", completedAt: "2026-03-10T09:00:06Z" },
  { agentName: "Sentiment", status: "running", startedAt: "2026-03-10T09:00:08Z", completedAt: null },
  { agentName: "Risk Assessment", status: "running", startedAt: "2026-03-10T09:00:08Z", completedAt: null },
  { agentName: "Report", status: "pending", startedAt: null, completedAt: null },
];

export const mockAgentStatusesCompleted: readonly AgentStatus[] = [
  { agentName: "User Profile", status: "completed", startedAt: "2026-03-10T09:00:00Z", completedAt: "2026-03-10T09:00:02Z" },
  { agentName: "News", status: "completed", startedAt: "2026-03-10T09:00:02Z", completedAt: "2026-03-10T09:00:08Z" },
  { agentName: "Stock", status: "completed", startedAt: "2026-03-10T09:00:02Z", completedAt: "2026-03-10T09:00:06Z" },
  { agentName: "Sentiment", status: "completed", startedAt: "2026-03-10T09:00:08Z", completedAt: "2026-03-10T09:00:14Z" },
  { agentName: "Risk Assessment", status: "completed", startedAt: "2026-03-10T09:00:08Z", completedAt: "2026-03-10T09:00:12Z" },
  { agentName: "Report", status: "completed", startedAt: "2026-03-10T09:00:14Z", completedAt: "2026-03-10T09:00:20Z" },
];

// ===== User Profile =====
export const mockUserProfile: UserProfile = {
  id: "profile-001",
  userId: "user-001",
  investmentStyle: "long_term",
  riskTolerance: "balanced",
  experienceLevel: "intermediate",
  interestedSectors: ["technology", "healthcare", "energy"],
  watchThemes: ["AI", "EV", "Semiconductor"],
  preferenceModel: {},
  updatedAt: "2026-03-08T12:00:00Z",
};

// ===== Watchlist =====
export const mockWatchlistItems: readonly WatchlistItem[] = [
  { symbol: "AAPL", market: "US", addedAt: "2026-02-01T00:00:00Z" },
  { symbol: "GOOGL", market: "US", addedAt: "2026-02-01T00:00:00Z" },
  { symbol: "NVDA", market: "US", addedAt: "2026-02-05T00:00:00Z" },
  { symbol: "TSLA", market: "US", addedAt: "2026-02-10T00:00:00Z" },
  { symbol: "7203.T", market: "JP", addedAt: "2026-02-15T00:00:00Z" },
  { symbol: "6758.T", market: "JP", addedAt: "2026-02-20T00:00:00Z" },
];

export const mockWatchlist: Watchlist = {
  id: "wl-001",
  userId: "user-001",
  symbols: mockWatchlistItems,
};

// ===== News Results =====
export const mockNewsResults: readonly NewsResult[] = [
  {
    id: "news-001",
    researchId: "research-001",
    title: "Apple Announces Revolutionary AI-Powered Features for iPhone 18",
    summary: "Apple unveiled a suite of new AI capabilities at its Spring event, including an on-device LLM for Siri and advanced computational photography. Analysts expect strong demand for the upcoming iPhone 18 lineup.",
    sourceUrl: "https://example.com/apple-ai",
    relatedSymbols: ["AAPL"],
    impactLevel: "high",
    relevanceScore: 0.92,
    publishedAt: "2026-03-10T06:00:00Z",
  },
  {
    id: "news-002",
    researchId: "research-001",
    title: "NVIDIA Reports Record Data Center Revenue Driven by AI Demand",
    summary: "NVIDIA's data center segment posted record quarterly revenue of $45B, up 80% YoY. The company raised its guidance citing sustained AI infrastructure spending from hyperscalers.",
    sourceUrl: "https://example.com/nvidia-earnings",
    relatedSymbols: ["NVDA"],
    impactLevel: "high",
    relevanceScore: 0.95,
    publishedAt: "2026-03-10T04:00:00Z",
  },
  {
    id: "news-003",
    researchId: "research-001",
    title: "Bank of Japan Signals Potential Rate Hike in April Meeting",
    summary: "BOJ Governor hinted at a possible rate increase at the next policy meeting, citing sustained inflation above 2%. Japanese exporters may face headwinds from yen strengthening.",
    sourceUrl: "https://example.com/boj-rate",
    relatedSymbols: ["7203.T", "6758.T"],
    impactLevel: "high",
    relevanceScore: 0.78,
    publishedAt: "2026-03-10T02:00:00Z",
  },
  {
    id: "news-004",
    researchId: "research-001",
    title: "Google DeepMind Achieves Breakthrough in Protein Design",
    summary: "Alphabet's DeepMind division announced a new AI system that can design novel proteins for drug development, potentially revolutionizing the pharmaceutical industry.",
    sourceUrl: "https://example.com/deepmind-protein",
    relatedSymbols: ["GOOGL"],
    impactLevel: "medium",
    relevanceScore: 0.85,
    publishedAt: "2026-03-09T22:00:00Z",
  },
  {
    id: "news-005",
    researchId: "research-001",
    title: "Tesla Expands Supercharger Network to 80,000 Stations Globally",
    summary: "Tesla announced the completion of its 80,000th Supercharger station, strengthening its competitive moat in EV infrastructure. The network now covers 95% of major highways in the US and Europe.",
    sourceUrl: "https://example.com/tesla-charger",
    relatedSymbols: ["TSLA"],
    impactLevel: "medium",
    relevanceScore: 0.82,
    publishedAt: "2026-03-09T18:00:00Z",
  },
  {
    id: "news-006",
    researchId: "research-001",
    title: "Semiconductor Supply Chain Showing Signs of Normalization",
    summary: "Industry reports indicate that chip supply shortages are easing as new fabs come online in Taiwan and Arizona. Lead times have decreased by 30% from peak levels.",
    sourceUrl: "https://example.com/semiconductor-supply",
    relatedSymbols: ["NVDA", "AAPL"],
    impactLevel: "low",
    relevanceScore: 0.7,
    publishedAt: "2026-03-09T14:00:00Z",
  },
];

// ===== Stock Results =====
export const mockStockResults: readonly StockResult[] = [
  {
    id: "stock-001",
    researchId: "research-001",
    symbol: "AAPL",
    closingPrice: 198.45,
    changePercent: 1.24,
    sma20: 195.3,
    sma50: 191.8,
    rsi14: 58.2,
    macd: { line: 2.1, signal: 1.8, histogram: 0.3 },
    bollingerBands: { upper: 205.2, middle: 195.3, lower: 185.4 },
    trend: "bullish",
    priceHistory: generatePriceHistory(190, 30, 3),
    fetchedAt: "2026-03-10T09:00:06Z",
  },
  {
    id: "stock-002",
    researchId: "research-001",
    symbol: "GOOGL",
    closingPrice: 172.8,
    changePercent: -0.85,
    sma20: 174.5,
    sma50: 170.2,
    rsi14: 44.1,
    macd: { line: -0.5, signal: 0.2, histogram: -0.7 },
    bollingerBands: { upper: 182.1, middle: 174.5, lower: 166.9 },
    trend: "neutral",
    priceHistory: generatePriceHistory(170, 30, 2.5),
    fetchedAt: "2026-03-10T09:00:06Z",
  },
  {
    id: "stock-003",
    researchId: "research-001",
    symbol: "NVDA",
    closingPrice: 285.6,
    changePercent: 3.42,
    sma20: 270.1,
    sma50: 255.8,
    rsi14: 72.5,
    macd: { line: 8.5, signal: 5.2, histogram: 3.3 },
    bollingerBands: { upper: 295.0, middle: 270.1, lower: 245.2 },
    trend: "bullish",
    priceHistory: generatePriceHistory(250, 30, 5),
    fetchedAt: "2026-03-10T09:00:06Z",
  },
  {
    id: "stock-004",
    researchId: "research-001",
    symbol: "TSLA",
    closingPrice: 245.3,
    changePercent: 0.62,
    sma20: 242.0,
    sma50: 238.5,
    rsi14: 52.8,
    macd: { line: 1.2, signal: 0.8, histogram: 0.4 },
    bollingerBands: { upper: 260.0, middle: 242.0, lower: 224.0 },
    trend: "neutral",
    priceHistory: generatePriceHistory(235, 30, 4),
    fetchedAt: "2026-03-10T09:00:06Z",
  },
  {
    id: "stock-005",
    researchId: "research-001",
    symbol: "7203.T",
    closingPrice: 2845,
    changePercent: -0.35,
    sma20: 2870,
    sma50: 2820,
    rsi14: 42.1,
    macd: { line: -12, signal: -5, histogram: -7 },
    bollingerBands: { upper: 2950, middle: 2870, lower: 2790 },
    trend: "bearish",
    priceHistory: generatePriceHistory(2800, 30, 30),
    fetchedAt: "2026-03-10T09:00:06Z",
  },
  {
    id: "stock-006",
    researchId: "research-001",
    symbol: "6758.T",
    closingPrice: 13250,
    changePercent: 0.92,
    sma20: 13100,
    sma50: 12800,
    rsi14: 55.3,
    macd: { line: 45, signal: 30, histogram: 15 },
    bollingerBands: { upper: 13600, middle: 13100, lower: 12600 },
    trend: "bullish",
    priceHistory: generatePriceHistory(12800, 30, 100),
    fetchedAt: "2026-03-10T09:00:06Z",
  },
];

// ===== Sentiment Results =====
export const mockSentimentResults: readonly SentimentResult[] = [
  { id: "sent-001", researchId: "research-001", symbol: "AAPL", sentimentScore: 0.65, sentimentLabel: "bullish", divergenceSignal: null, marketOverallSentiment: 0.42, analyzedAt: "2026-03-10T09:00:14Z" },
  { id: "sent-002", researchId: "research-001", symbol: "GOOGL", sentimentScore: 0.15, sentimentLabel: "neutral", divergenceSignal: "Price declining despite positive AI news — potential reversal signal", marketOverallSentiment: 0.42, analyzedAt: "2026-03-10T09:00:14Z" },
  { id: "sent-003", researchId: "research-001", symbol: "NVDA", sentimentScore: 0.82, sentimentLabel: "very_bullish", divergenceSignal: null, marketOverallSentiment: 0.42, analyzedAt: "2026-03-10T09:00:14Z" },
  { id: "sent-004", researchId: "research-001", symbol: "TSLA", sentimentScore: 0.35, sentimentLabel: "bullish", divergenceSignal: null, marketOverallSentiment: 0.42, analyzedAt: "2026-03-10T09:00:14Z" },
  { id: "sent-005", researchId: "research-001", symbol: "7203.T", sentimentScore: -0.28, sentimentLabel: "bearish", divergenceSignal: "BOJ rate hike concern weighing on exporters", marketOverallSentiment: 0.42, analyzedAt: "2026-03-10T09:00:14Z" },
  { id: "sent-006", researchId: "research-001", symbol: "6758.T", sentimentScore: 0.22, sentimentLabel: "neutral", divergenceSignal: null, marketOverallSentiment: 0.42, analyzedAt: "2026-03-10T09:00:14Z" },
];

// ===== Risk Assessment =====
export const mockRiskAssessment: RiskAssessment = {
  id: "risk-001",
  researchId: "research-001",
  overallRiskScore: 45,
  sectorConcentration: [
    { sector: "Technology", ratio: 0.67 },
    { sector: "Automotive", ratio: 0.22 },
    { sector: "Electronics", ratio: 0.11 },
  ],
  volatilityRanks: [
    { symbol: "NVDA", volatility: 42.5, rank: 1 },
    { symbol: "TSLA", volatility: 38.2, rank: 2 },
    { symbol: "6758.T", volatility: 28.1, rank: 3 },
    { symbol: "AAPL", volatility: 22.3, rank: 4 },
    { symbol: "7203.T", volatility: 18.7, rank: 5 },
    { symbol: "GOOGL", volatility: 20.1, rank: 6 },
  ],
  riskToleranceAlignment: "aligned",
  warnings: [
    "Technology sector concentration at 67% — consider diversifying",
    "NVDA RSI above 70 — overbought signal detected",
  ],
  assessedAt: "2026-03-10T09:00:12Z",
};

// ===== Suggestions =====
export const mockSuggestions: readonly InvestmentSuggestion[] = [
  {
    id: "sug-001",
    reportId: "report-001",
    symbol: "AAPL",
    action: "buy",
    confidence: 0.78,
    reasoning: "Strong AI product momentum with new iPhone 18 features. Price above both SMA20 and SMA50 with healthy RSI. Bullish sentiment aligned with upward trend.",
    referencedNewsIds: ["news-001", "news-006"],
    sentimentBasis: "Bullish sentiment (0.65) driven by AI product announcements",
    riskBasis: "Moderate volatility, within balanced risk tolerance range",
    createdAt: "2026-03-10T09:00:20Z",
  },
  {
    id: "sug-002",
    reportId: "report-001",
    symbol: "NVDA",
    action: "hold",
    confidence: 0.65,
    reasoning: "Record revenue and strong AI demand, but RSI at 72.5 indicates overbought conditions. Consider waiting for a pullback before adding to position.",
    referencedNewsIds: ["news-002", "news-006"],
    sentimentBasis: "Very bullish sentiment (0.82) but momentum may be peaking",
    riskBasis: "Highest volatility in portfolio. Overbought RSI warrants caution.",
    createdAt: "2026-03-10T09:00:20Z",
  },
  {
    id: "sug-003",
    reportId: "report-001",
    symbol: "7203.T",
    action: "skip",
    confidence: 0.62,
    reasoning: "BOJ rate hike signals creating headwinds for Japanese exporters. Bearish trend with RSI declining below 50. Yen strengthening risk for Toyota's overseas earnings.",
    referencedNewsIds: ["news-003"],
    sentimentBasis: "Bearish sentiment (-0.28) driven by monetary policy concerns",
    riskBasis: "Currency risk and declining technical indicators",
    createdAt: "2026-03-10T09:00:20Z",
  },
  {
    id: "sug-004",
    reportId: "report-001",
    symbol: "GOOGL",
    action: "hold",
    confidence: 0.45,
    reasoning: "Mixed signals — positive AI breakthroughs from DeepMind but price showing weakness. Potential divergence signal between sentiment and price action may indicate upcoming reversal.",
    referencedNewsIds: ["news-004"],
    sentimentBasis: "Neutral sentiment (0.15) despite positive AI news — divergence detected",
    riskBasis: "Moderate risk. Regulatory concerns remain a watchpoint.",
    createdAt: "2026-03-10T09:00:20Z",
  },
  {
    id: "sug-005",
    reportId: "report-001",
    symbol: "TSLA",
    action: "hold",
    confidence: 0.52,
    reasoning: "Supercharger network expansion strengthens competitive position, but the stock lacks clear directional momentum. Neutral trend with balanced risk/reward.",
    referencedNewsIds: ["news-005"],
    sentimentBasis: "Mildly bullish sentiment (0.35) on infrastructure news",
    riskBasis: "High volatility but neutral technical setup",
    createdAt: "2026-03-10T09:00:20Z",
  },
  {
    id: "sug-006",
    reportId: "report-001",
    symbol: "6758.T",
    action: "buy",
    confidence: 0.58,
    reasoning: "Bullish trend above both moving averages. Electronics sector showing resilience. Lower correlation to yen risk compared to auto sector.",
    referencedNewsIds: ["news-003"],
    sentimentBasis: "Neutral sentiment (0.22) but technical indicators are positive",
    riskBasis: "Moderate volatility. BOJ risk partially offset by diversified revenue base.",
    createdAt: "2026-03-10T09:00:20Z",
  },
];

// ===== Report =====
export const mockReport: PersonalizedReport = {
  id: "report-001",
  researchId: "research-001",
  summary: "Today's market shows a cautiously optimistic outlook for your portfolio. US tech stocks are benefiting from continued AI investment momentum, with NVIDIA posting record data center revenue. However, the semiconductor sector shows signs of overheating — NVDA's RSI above 70 suggests potential for a near-term pullback. Japanese markets face headwinds from potential BOJ rate hikes, particularly impacting exporters like Toyota. For your long-term, balanced investment style, we recommend selectively adding to positions in fundamentally strong names while maintaining risk discipline.",
  suggestions: mockSuggestions,
  riskNotes: "Your portfolio is heavily concentrated in the technology sector (67%). While this aligns with your interest in AI and semiconductors, consider adding exposure to other sectors for better diversification. Overall risk score of 45/100 is within your balanced risk tolerance.",
  generatedAt: "2026-03-10T09:00:20Z",
  tone: "technical",
};

// ===== Full Research =====
export const mockDailyResearch: DailyResearch = {
  id: "research-001",
  userId: "user-001",
  date: "2026-03-10",
  status: "completed",
  agentStatuses: mockAgentStatusesCompleted,
  newsResults: mockNewsResults,
  stockResults: mockStockResults,
  sentimentResults: mockSentimentResults,
  riskAssessment: mockRiskAssessment,
  report: mockReport,
  createdAt: "2026-03-10T09:00:00Z",
};

// ===== Research History =====
export const mockResearchHistory: readonly ResearchHistoryItem[] = [
  { id: "research-001", date: "2026-03-10", status: "completed", createdAt: "2026-03-10T09:00:00Z" },
  { id: "research-002", date: "2026-03-09", status: "completed", createdAt: "2026-03-09T09:00:00Z" },
  { id: "research-003", date: "2026-03-08", status: "completed", createdAt: "2026-03-08T09:00:00Z" },
  { id: "research-004", date: "2026-03-07", status: "failed", createdAt: "2026-03-07T09:00:00Z" },
  { id: "research-005", date: "2026-03-06", status: "completed", createdAt: "2026-03-06T09:00:00Z" },
  { id: "research-006", date: "2026-03-05", status: "completed", createdAt: "2026-03-05T09:00:00Z" },
  { id: "research-007", date: "2026-03-04", status: "completed", createdAt: "2026-03-04T09:00:00Z" },
];
