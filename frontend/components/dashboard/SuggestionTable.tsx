"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { clsx } from "clsx";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { InvestmentSuggestion, SuggestionAction } from "@/lib/types";

type SuggestionTableProps = {
  readonly suggestions: readonly InvestmentSuggestion[];
};

const actionConfig: Record<
  SuggestionAction,
  { label: string; variant: "green" | "yellow" | "red" }
> = {
  buy: { label: "Buy", variant: "green" },
  hold: { label: "Hold", variant: "yellow" },
  skip: { label: "Skip", variant: "red" },
};

const SuggestionRow = ({
  suggestion,
}: {
  readonly suggestion: InvestmentSuggestion;
}) => {
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const config = actionConfig[suggestion.action];
  const confidencePercent = Math.round(suggestion.confidence * 100);

  return (
    <tr className="border-b border-card-border last:border-0 transition-colors hover:bg-hover-bg/50">
      <td className="px-4 py-3">
        <span className="font-mono text-sm font-semibold text-foreground">
          {suggestion.symbol}
        </span>
      </td>
      <td className="px-4 py-3">
        <Badge variant={config.variant}>{config.label}</Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 rounded-full bg-slate-700">
            <div
              className={clsx(
                "h-1.5 rounded-full transition-all duration-500",
                confidencePercent >= 70 && "bg-emerald-400",
                confidencePercent >= 50 && confidencePercent < 70 && "bg-amber-400",
                confidencePercent < 50 && "bg-slate-400"
              )}
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
          <span className="text-xs text-muted">{confidencePercent}%</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="max-w-xs text-xs leading-relaxed text-slate-400">
          {suggestion.reasoning}
        </p>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setFeedback(true)}
            className={clsx(
              "rounded-md p-1.5 transition-colors",
              feedback === true
                ? "bg-emerald-500/20 text-emerald-400"
                : "text-slate-600 hover:bg-hover-bg hover:text-emerald-400"
            )}
            title="Helpful"
          >
            <ThumbsUp size={14} />
          </button>
          <button
            type="button"
            onClick={() => setFeedback(false)}
            className={clsx(
              "rounded-md p-1.5 transition-colors",
              feedback === false
                ? "bg-red-500/20 text-red-400"
                : "text-slate-600 hover:bg-hover-bg hover:text-red-400"
            )}
            title="Not helpful"
          >
            <ThumbsDown size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
};

const SuggestionTable = ({ suggestions }: SuggestionTableProps) => (
  <Card title="Investment Suggestions">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-card-border text-left">
            <th className="px-4 py-2 text-xs font-medium text-muted">Symbol</th>
            <th className="px-4 py-2 text-xs font-medium text-muted">Action</th>
            <th className="px-4 py-2 text-xs font-medium text-muted">Confidence</th>
            <th className="px-4 py-2 text-xs font-medium text-muted">Reasoning</th>
            <th className="px-4 py-2 text-xs font-medium text-muted">Feedback</th>
          </tr>
        </thead>
        <tbody>
          {suggestions.map((suggestion) => (
            <SuggestionRow key={suggestion.id} suggestion={suggestion} />
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

export default SuggestionTable;
