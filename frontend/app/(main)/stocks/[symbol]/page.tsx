"use client";

import { use } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
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
            <Link href="/" className="mt-4 text-sm text-accent-blue hover:underline">
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
      <div className="space-y-6 p-6">
        {/* Back nav + title */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="rounded-lg p-2 text-muted transition-colors hover:bg-hover-bg hover:text-foreground"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{symbol}</h1>
              <Badge variant={trend.variant}>
                <span className="flex items-center gap-1">
                  {trend.icon} {trend.label}
                </span>
              </Badge>
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">
                {isJP ? "¥" : "$"}
                {isJP ? stock.closingPrice.toLocaleString() : stock.closingPrice.toFixed(2)}
              </span>
              <span
                className={clsx(
                  "text-lg font-semibold",
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
        <StockChart
          symbol={stock.symbol}
          priceHistory={stock.priceHistory}
          trend={stock.trend}
        />

        {/* Technical Indicators + Sentiment + Suggestion */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Technical Indicators */}
          <Card title="Technical Indicators">
            <div className="space-y-3">
              {[
                { label: "SMA 20", value: isJP ? `¥${stock.sma20.toLocaleString()}` : `$${stock.sma20.toFixed(2)}` },
                { label: "SMA 50", value: isJP ? `¥${stock.sma50.toLocaleString()}` : `$${stock.sma50.toFixed(2)}` },
                { label: "RSI (14)", value: stock.rsi14.toFixed(1), highlight: stock.rsi14 > 70 || stock.rsi14 < 30 },
                { label: "MACD Line", value: stock.macd.line.toFixed(2) },
                { label: "MACD Signal", value: stock.macd.signal.toFixed(2) },
                { label: "MACD Histogram", value: stock.macd.histogram.toFixed(2) },
                { label: "BB Upper", value: isJP ? `¥${stock.bollingerBands.upper.toLocaleString()}` : `$${stock.bollingerBands.upper.toFixed(2)}` },
                { label: "BB Middle", value: isJP ? `¥${stock.bollingerBands.middle.toLocaleString()}` : `$${stock.bollingerBands.middle.toFixed(2)}` },
                { label: "BB Lower", value: isJP ? `¥${stock.bollingerBands.lower.toLocaleString()}` : `$${stock.bollingerBands.lower.toFixed(2)}` },
              ].map((ind) => (
                <div key={ind.label} className="flex items-center justify-between">
                  <span className="text-xs text-muted">{ind.label}</span>
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
            <Card title="Sentiment Analysis">
              <div className="flex flex-col items-center gap-4">
                <Gauge value={sentiment.sentimentScore} size="lg" />
                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted">Score</span>
                    <span className="font-mono text-sm font-medium text-foreground">
                      {sentiment.sentimentScore.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted">Label</span>
                    <Badge
                      variant={
                        sentiment.sentimentScore >= 0.2
                          ? "green"
                          : sentiment.sentimentScore >= -0.2
                            ? "yellow"
                            : "red"
                      }
                    >
                      {sentiment.sentimentLabel.replace("_", " ")}
                    </Badge>
                  </div>
                  {sentiment.divergenceSignal && (
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                      <p className="text-xs font-medium text-amber-400">
                        Divergence Signal
                      </p>
                      <p className="mt-1 text-xs text-amber-200/80">
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
            <Card title="AI Suggestion">
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
                  >
                    {suggestion.action.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-muted">
                    Confidence: {Math.round(suggestion.confidence * 100)}%
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-slate-300">
                  {suggestion.reasoning}
                </p>
                <div className="space-y-2">
                  <div className="rounded-lg bg-slate-800/50 p-3">
                    <p className="text-xs font-medium text-muted">Sentiment Basis</p>
                    <p className="mt-1 text-xs text-slate-300">{suggestion.sentimentBasis}</p>
                  </div>
                  <div className="rounded-lg bg-slate-800/50 p-3">
                    <p className="text-xs font-medium text-muted">Risk Basis</p>
                    <p className="mt-1 text-xs text-slate-300">{suggestion.riskBasis}</p>
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
