"use client";

import { use } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Activity, Brain, Shield } from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import StockChart from "@/components/stocks/StockChart";
import Gauge from "@/components/ui/Gauge";
import {
  mockStockResults,
  mockSentimentResults,
  mockSuggestions,
} from "@/lib/mock-data";
import type { Trend } from "@/lib/types";
import { clsx } from "clsx";

type StockDetailPageProps = {
  readonly params: Promise<{ symbol: string }>;
};

const trendConfig: Record<Trend, { icon: React.ReactNode; label: string; variant: "green" | "red" | "yellow" }> = {
  bullish: { icon: <TrendingUp size={16} />, label: "Bullish", variant: "green" },
  bearish: { icon: <TrendingDown size={16} />, label: "Bearish", variant: "red" },
  neutral: { icon: <Minus size={16} />, label: "Neutral", variant: "yellow" },
};

const StockDetailPage = (props: StockDetailPageProps) => {
  const params = use(props.params);
  const symbol = decodeURIComponent(params.symbol);
  const stock = mockStockResults.find((s) => s.symbol === symbol);
  const sentiment = mockSentimentResults.find((s) => s.symbol === symbol);
  const suggestion = mockSuggestions.find((s) => s.symbol === symbol);

  if (!stock) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center p-20">
          <div className="text-center">
            <p className="text-lg text-muted">Stock not found: {symbol}</p>
            <Link href="/" className="mt-4 inline-block text-sm text-accent-blue hover:underline">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const trend = trendConfig[stock.trend];
  const isPositive = stock.changePercent >= 0;
  const isJP = symbol.endsWith(".T");

  return (
    <div className="min-h-screen">
      <Header />
      <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
        {/* Back nav + title */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="rounded-xl p-2.5 text-slate-500 transition-all duration-200 hover:bg-hover-bg hover:text-foreground"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{symbol}</h1>
              <Badge variant={trend.variant} dot>
                <span className="flex items-center gap-1">
                  {trend.icon} {trend.label}
                </span>
              </Badge>
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground font-mono tracking-tight">
                {isJP ? "\u00a5" : "$"}
                {isJP ? stock.closingPrice.toLocaleString() : stock.closingPrice.toFixed(2)}
              </span>
              <span
                className={clsx(
                  "text-lg font-semibold font-mono",
                  isPositive ? "text-emerald-400" : "text-red-400"
                )}
              >
                {isPositive ? "+" : ""}
                {stock.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="animate-slide-up">
          <StockChart
            symbol={stock.symbol}
            priceHistory={stock.priceHistory}
            trend={stock.trend}
          />
        </div>

        {/* Technical Indicators + Sentiment + Suggestion */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Technical Indicators */}
          <Card
            title="Technical Indicators"
            accent="blue"
          >
            <div className="space-y-2.5">
              {[
                { label: "SMA 20", value: isJP ? `\u00a5${stock.indicators.sma20.toLocaleString()}` : `$${stock.indicators.sma20.toFixed(2)}`, group: "MA" },
                { label: "SMA 50", value: isJP ? `\u00a5${stock.indicators.sma50.toLocaleString()}` : `$${stock.indicators.sma50.toFixed(2)}`, group: "MA" },
                { label: "RSI (14)", value: stock.indicators.rsi14.toFixed(1), highlight: stock.indicators.rsi14 > 70 || stock.indicators.rsi14 < 30, group: "Momentum" },
                { label: "MACD Line", value: stock.indicators.macd.line.toFixed(2), group: "MACD" },
                { label: "MACD Signal", value: stock.indicators.macd.signal.toFixed(2), group: "MACD" },
                { label: "MACD Hist", value: stock.indicators.macd.histogram.toFixed(2), group: "MACD" },
                { label: "BB Upper", value: isJP ? `\u00a5${stock.indicators.bollingerBands.upper.toLocaleString()}` : `$${stock.indicators.bollingerBands.upper.toFixed(2)}`, group: "BB" },
                { label: "BB Middle", value: isJP ? `\u00a5${stock.indicators.bollingerBands.middle.toLocaleString()}` : `$${stock.indicators.bollingerBands.middle.toFixed(2)}`, group: "BB" },
                { label: "BB Lower", value: isJP ? `\u00a5${stock.indicators.bollingerBands.lower.toLocaleString()}` : `$${stock.indicators.bollingerBands.lower.toFixed(2)}`, group: "BB" },
              ].map((ind) => (
                <div key={ind.label} className="flex items-center justify-between rounded-lg px-1 py-0.5">
                  <span className="text-[11px] text-slate-500">{ind.label}</span>
                  <span
                    className={clsx(
                      "font-mono text-sm font-medium",
                      ind.highlight ? "text-amber-400" : "text-foreground"
                    )}
                  >
                    {ind.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Sentiment */}
          {sentiment && (
            <Card title="Sentiment Analysis" accent="purple">
              <div className="flex flex-col items-center gap-5">
                <Gauge value={sentiment.sentimentScore} size="lg" />

                <div className="h-px w-full bg-gradient-to-r from-transparent via-card-border to-transparent" />

                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Score</span>
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {sentiment.sentimentScore.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Label</span>
                    <Badge
                      variant={
                        sentiment.sentimentScore >= 0.2
                          ? "green"
                          : sentiment.sentimentScore >= -0.2
                            ? "yellow"
                            : "red"
                      }
                      dot
                    >
                      {sentiment.sentimentLabel.replace("_", " ")}
                    </Badge>
                  </div>
                  {sentiment.divergenceSignal && (
                    <div className="rounded-xl border border-amber-500/10 bg-amber-500/3 p-3">
                      <p className="text-[11px] font-semibold text-amber-400">
                        Divergence Signal
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-amber-200/70">
                        {sentiment.divergenceSignal}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Suggestion */}
          {suggestion && (
            <Card title="AI Suggestion" accent="green">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      suggestion.action === "buy"
                        ? "green"
                        : suggestion.action === "skip"
                          ? "red"
                          : "yellow"
                    }
                    dot
                  >
                    {suggestion.action.toUpperCase()}
                  </Badge>
                  <span className="font-mono text-xs text-slate-500">
                    Confidence: {Math.round(suggestion.confidence * 100)}%
                  </span>
                </div>
                <p className="text-[13px] leading-relaxed text-slate-300/90">
                  {suggestion.reasoning}
                </p>
                <div className="space-y-2">
                  <div className="flex gap-2.5 rounded-xl border border-card-border/50 bg-white/[0.01] p-3">
                    <Brain size={14} className="mt-0.5 shrink-0 text-purple-400/60" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Sentiment Basis</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{suggestion.sentimentBasis}</p>
                    </div>
                  </div>
                  <div className="flex gap-2.5 rounded-xl border border-card-border/50 bg-white/[0.01] p-3">
                    <Shield size={14} className="mt-0.5 shrink-0 text-amber-400/60" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Risk Basis</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{suggestion.riskBasis}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockDetailPage;
