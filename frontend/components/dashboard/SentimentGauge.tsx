"use client";

import Card from "@/components/ui/Card";
import Gauge from "@/components/ui/Gauge";
import Badge from "@/components/ui/Badge";
import type { SentimentResult } from "@/lib/types";
import { clsx } from "clsx";

type SentimentGaugeProps = {
  readonly marketSentiment: number;
  readonly sentiments: readonly SentimentResult[];
};

const sentimentColor = (score: number): string => {
  if (score >= 0.5) return "text-emerald-400";
  if (score >= 0.2) return "text-emerald-300";
  if (score >= -0.2) return "text-amber-400";
  if (score >= -0.5) return "text-red-300";
  return "text-red-400";
};

const sentimentVariant = (score: number): "green" | "yellow" | "red" => {
  if (score >= 0.2) return "green";
  if (score >= -0.2) return "yellow";
  return "red";
};

const sentimentBarColor = (score: number): string => {
  if (score >= 0.2) return "bg-emerald-500/50";
  if (score >= -0.2) return "bg-amber-500/50";
  return "bg-red-500/50";
};

const SentimentGauge = ({ marketSentiment, sentiments }: SentimentGaugeProps) => (
  <Card title="Market Sentiment">
    <div className="flex flex-col items-center gap-5">
      {/* Main gauge */}
      <div className="relative">
        <Gauge value={marketSentiment} size="lg" />
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-card-border to-transparent" />

      {/* Per-symbol sentiments */}
      <div className="w-full space-y-1.5">
        {sentiments.map((s) => (
          <div
            key={s.id}
            className="group flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 hover:bg-white/[0.02]"
          >
            <span className="w-14 font-mono text-xs font-semibold text-foreground">
              {s.symbol}
            </span>

            {/* Mini bar visualization */}
            <div className="flex-1 h-1 rounded-full bg-slate-800/60 overflow-hidden">
              <div
                className={clsx("h-full rounded-full transition-all duration-500", sentimentBarColor(s.sentimentScore))}
                style={{ width: `${Math.abs(s.sentimentScore) * 100}%`, marginLeft: s.sentimentScore < 0 ? "auto" : 0 }}
              />
            </div>

            <span className={clsx("w-8 text-right font-mono text-[11px] font-semibold", sentimentColor(s.sentimentScore))}>
              {s.sentimentScore > 0 ? "+" : ""}
              {(s.sentimentScore * 100).toFixed(0)}
            </span>
            <Badge variant={sentimentVariant(s.sentimentScore)}>
              {s.sentimentLabel.replace("_", " ")}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  </Card>
);

export default SentimentGauge;
