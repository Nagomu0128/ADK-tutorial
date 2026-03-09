"use client";

import { ExternalLink } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { NewsResult, ImpactLevel } from "@/lib/types";
import { format } from "date-fns";
import { clsx } from "clsx";

type NewsFeedProps = {
  readonly news: readonly NewsResult[];
};

const impactConfig: Record<ImpactLevel, { variant: "red" | "yellow" | "gray"; label: string; accentColor: string }> = {
  high: { variant: "red", label: "HIGH", accentColor: "bg-red-500/40" },
  medium: { variant: "yellow", label: "MED", accentColor: "bg-amber-500/40" },
  low: { variant: "gray", label: "LOW", accentColor: "bg-slate-500/30" },
};

const NewsItem = ({ item, index }: { readonly item: NewsResult; readonly index: number }) => {
  const impact = impactConfig[item.impactLevel];
  const delayClass = `delay-${Math.min(index * 75, 450)}`;

  return (
    <div className={clsx(
      "animate-fade-in group relative border-b border-card-border/30 py-3.5 last:border-0 transition-all duration-200",
      "hover:bg-white/[0.015]",
      delayClass
    )}>
      {/* Left accent bar */}
      <div className={clsx("absolute left-0 top-4 bottom-4 w-[2px] rounded-full transition-opacity", impact.accentColor)} />

      <div className="flex items-start justify-between gap-3 pl-4">
        <div className="flex-1 min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <Badge variant={impact.variant} dot>{impact.label}</Badge>
            {item.relatedSymbols.map((sym) => (
              <Badge key={sym} variant="blue">{sym}</Badge>
            ))}
            <span className="text-[10px] text-slate-600">
              {format(new Date(item.publishedAt), "MMM d, HH:mm")}
            </span>
          </div>
          <h4 className="text-[13px] font-medium leading-snug text-foreground/90 group-hover:text-foreground transition-colors">
            {item.title}
          </h4>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500 line-clamp-2">
            {item.summary}
          </p>
          {/* Relevance indicator */}
          <div className="mt-2 flex items-center gap-2">
            <div className="h-[3px] w-12 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500/60 to-cyan-400/40"
                style={{ width: `${item.relevanceScore * 100}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-600">
              {Math.round(item.relevanceScore * 100)}% relevant
            </span>
          </div>
        </div>
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-lg p-2 text-slate-700 opacity-0 transition-all duration-200 hover:bg-white/5 hover:text-foreground group-hover:opacity-100"
        >
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
};

const NewsFeed = ({ news }: NewsFeedProps) => {
  const sorted = [...news].sort((a, b) => b.relevanceScore - a.relevanceScore);

  return (
    <Card
      title="News Feed"
      titleRight={<span className="text-[10px] text-slate-600">by relevance</span>}
      noPadding
    >
      <div className="max-h-[480px] overflow-y-auto px-5 pb-4">
        {sorted.map((item, i) => (
          <NewsItem key={item.id} item={item} index={i} />
        ))}
      </div>
    </Card>
  );
};

export default NewsFeed;
