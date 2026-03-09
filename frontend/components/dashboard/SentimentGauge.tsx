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

const SentimentGauge = ({ marketSentiment, sentiments }: SentimentGaugeProps) => (
  <Card title="Market Sentiment">
    <div className="flex flex-col items-center gap-4">
      <Gauge value={marketSentiment} size="lg" />
      <div className="w-full space-y-2">
        {sentiments.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between rounded-lg px-3 py-1.5"
          >
            <span className="font-mono text-xs font-medium text-foreground">
              {s.symbol}
            </span>
            <div className="flex items-center gap-2">
              <span className={clsx("text-xs font-semibold", sentimentColor(s.sentimentScore))}>
                {s.sentimentScore > 0 ? "+" : ""}
                {(s.sentimentScore * 100).toFixed(0)}
              </span>
              <Badge variant={sentimentVariant(s.sentimentScore)}>
                {s.sentimentLabel.replace("_", " ")}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  </Card>
);

export default SentimentGauge;
