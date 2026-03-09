"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, ArrowRight } from "lucide-react";
import { clsx } from "clsx";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { InvestmentSuggestion, SuggestionAction } from "@/lib/types";
import Link from "next/link";

type SuggestionTableProps = {
  readonly suggestions: readonly InvestmentSuggestion[];
};

const actionConfig: Record<
  SuggestionAction,
  { label: string; variant: "green" | "yellow" | "red"; borderColor: string }
> = {
  buy: { label: "Buy", variant: "green", borderColor: "border-l-emerald-500/40" },
  hold: { label: "Hold", variant: "yellow", borderColor: "border-l-amber-500/40" },
  skip: { label: "Skip", variant: "red", borderColor: "border-l-red-500/40" },
};

const confidenceGradient = (percent: number): string => {
  if (percent >= 70) return "from-emerald-500/80 to-emerald-400/40";
  if (percent >= 50) return "from-amber-500/80 to-amber-400/40";
  return "from-slate-500/60 to-slate-400/30";
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
    <tr
      className={clsx(
        "group border-b border-card-border/50 last:border-0",
        "transition-all duration-200 hover:bg-white/[0.02]",
        "border-l-2",
        config.borderColor
      )}
    >
      <td className="px-4 py-3.5">
        <Link
          href={`/stocks/${encodeURIComponent(suggestion.symbol)}`}
          className="group/link flex items-center gap-1.5"
        >
          <span className="font-mono text-sm font-bold text-foreground tracking-wide">
            {suggestion.symbol}
          </span>
          <ArrowRight size={12} className="text-slate-600 opacity-0 transition-all group-hover/link:opacity-100 group-hover/link:text-accent-blue" />
        </Link>
      </td>
      <td className="px-4 py-3.5">
        <Badge variant={config.variant} dot>{config.label}</Badge>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-800">
            <div
              className={clsx(
                "h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out",
                confidenceGradient(confidencePercent)
              )}
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
          <span className="min-w-[32px] font-mono text-xs font-semibold text-slate-400">
            {confidencePercent}%
          </span>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <p className="max-w-xs text-xs leading-relaxed text-slate-400/90">
          {suggestion.reasoning}
        </p>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setFeedback(true)}
            className={clsx(
              "rounded-lg p-2 transition-all duration-200",
              feedback === true
                ? "bg-emerald-500/15 text-emerald-400 shadow-sm shadow-emerald-500/10"
                : "text-slate-600 hover:bg-emerald-500/10 hover:text-emerald-400"
            )}
            title="Helpful"
          >
            <ThumbsUp size={13} />
          </button>
          <button
            type="button"
            onClick={() => setFeedback(false)}
            className={clsx(
              "rounded-lg p-2 transition-all duration-200",
              feedback === false
                ? "bg-red-500/15 text-red-400 shadow-sm shadow-red-500/10"
                : "text-slate-600 hover:bg-red-500/10 hover:text-red-400"
            )}
            title="Not helpful"
          >
            <ThumbsDown size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
};

const SuggestionTable = ({ suggestions }: SuggestionTableProps) => (
  <Card title="Investment Suggestions" noPadding>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-card-border/50">
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-600">Symbol</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-600">Action</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-600">Confidence</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-600">Reasoning</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-600">Feedback</th>
          </tr>
        </thead>
        <tbody>
          {suggestions.map((suggestion) => (
            <SuggestionRow key={suggestion.id} suggestion={suggestion} />
          ))}
        </tbody>
      </table>
    </div>
    {/* Bottom padding inside noPadding card */}
    <div className="h-2" />
  </Card>
);

export default SuggestionTable;
