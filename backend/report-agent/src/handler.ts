import { ResultAsync } from "neverthrow";
import { match } from "ts-pattern";
import {
  errorBuilder,
  type InferError,
  appLogger,
  type NewsResult,
  type StockResult,
  type SentimentResult,
  type RiskAssessment,
  type UserProfile,
  type PersonalizedReport,
  type InvestmentSuggestion,
  type ReportTone,
  type SuggestionAction,
  runAgentForJson,
} from "@stock-advisor/shared";

export const ReportError = errorBuilder("ReportError");
export type ReportError = InferError<typeof ReportError>;

const logger = appLogger("report-agent:handler");

type GenerateReportInput = {
  readonly news: readonly NewsResult[];
  readonly stocks: readonly StockResult[];
  readonly sentiments: readonly SentimentResult[];
  readonly riskAssessment: RiskAssessment;
  readonly profile: UserProfile;
};

type ParsedReport = {
  readonly summary: string;
  readonly suggestions: readonly {
    readonly symbol: string;
    readonly action: SuggestionAction;
    readonly confidence: number;
    readonly reasoning: string;
    readonly sentimentBasis: string;
    readonly riskBasis: string;
  }[];
  readonly riskNotes: string;
};

const determineTone = (profile: UserProfile): ReportTone =>
  match(profile.experienceLevel)
    .with("beginner", () => "beginner_friendly" as const)
    .with("advanced", () => "technical" as const)
    .with("intermediate", () => "concise" as const)
    .exhaustive();

const buildInstruction = (tone: ReportTone, style: UserProfile["investmentStyle"]): string => {
  const toneInstruction = match(tone)
    .with("beginner_friendly", () => "初心者向けに分かりやすく、専門用語には簡単な説明を添えてください。")
    .with("technical", () => "テクニカル指標やファンダメンタル分析の観点から詳細に分析してください。")
    .with("concise", () => "簡潔に要点をまとめてください。")
    .exhaustive();

  const styleInstruction = match(style)
    .with("short_term", () => "エントリーとエグジットのタイミングに注目。")
    .with("swing", () => "数日〜数週間のスイングの観点で分析。")
    .with("long_term", () => "中長期的なファンダメンタルと成長性に注目。")
    .with("dividend", () => "配当利回りと企業の安定性に注目。")
    .exhaustive();

  return `You are a personalized investment advisor. Generate reports in Japanese.
${toneInstruction} ${styleInstruction}
Return JSON: { "summary": "2-4 sentences", "suggestions": [{ "symbol", "action": "buy"|"hold"|"skip", "confidence": 0-1, "reasoning", "sentimentBasis", "riskBasis" }], "riskNotes": "..." }
Include suggestion for EVERY symbol. Respond ONLY with valid JSON.`;
};

export const handleGenerateReport = (
  input: GenerateReportInput,
): ResultAsync<{ report: PersonalizedReport }, ReportError> => {
  logger.info("Generating personalized report", {
    stockCount: input.stocks.length,
    style: input.profile.investmentStyle,
  });

  const tone = determineTone(input.profile);

  const contextMessage = `Profile: ${input.profile.investmentStyle}, risk=${input.profile.riskTolerance}, sectors=${input.profile.interestedSectors.join(",")}

News:
${input.news.slice(0, 10).map((n) => `- [${n.impactLevel}] ${n.title}: ${n.summary}`).join("\n")}

Stocks:
${input.stocks.map((s) => `- ${s.symbol}: ${s.closingPrice} (${s.changePercent > 0 ? "+" : ""}${s.changePercent.toFixed(2)}%), trend=${s.trend}, RSI=${s.indicators.rsi14}`).join("\n")}

Sentiment:
${input.sentiments.map((s) => `- ${s.symbol}: score=${s.sentimentScore.toFixed(2)} (${s.sentimentLabel})${s.divergenceSignal ? `, divergence: ${s.divergenceSignal}` : ""}`).join("\n")}

Risk: score=${input.riskAssessment.overallRiskScore}/100, alignment=${input.riskAssessment.riskToleranceAlignment}
Warnings: ${input.riskAssessment.warnings.join("; ") || "none"}`;

  return ResultAsync.fromPromise(
    runAgentForJson<ParsedReport>(
      {
        name: "report_generator",
        description: "Generates personalized investment reports",
        instruction: buildInstruction(tone, input.profile.investmentStyle),
      },
      contextMessage,
    ),
    ReportError.handle,
  ).map((parsed) => {
    const reportId = crypto.randomUUID();

    const suggestions: readonly InvestmentSuggestion[] = parsed.suggestions.map((s) => ({
      id: crypto.randomUUID(),
      reportId,
      symbol: s.symbol,
      action: s.action,
      confidence: s.confidence,
      reasoning: s.reasoning,
      referencedNewsIds: input.news
        .filter((n) => n.relatedSymbols.includes(s.symbol))
        .map((n) => n.id),
      sentimentBasis: s.sentimentBasis,
      riskBasis: s.riskBasis,
      createdAt: new Date().toISOString(),
    }));

    return {
      report: {
        id: reportId,
        researchId: "",
        summary: parsed.summary,
        suggestions,
        riskNotes: parsed.riskNotes,
        generatedAt: new Date().toISOString(),
        tone,
      },
    };
  });
};
