"use client";

import { ExternalLink } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { NewsResult, ImpactLevel } from "@/lib/types";
import { format } from "date-fns";

type NewsFeedProps = {
  readonly news: readonly NewsResult[];
};

const impactConfig: Record<ImpactLevel, { variant: "red" | "yellow" | "gray"; label: string }> = {
  high: { variant: "red", label: "HIGH" },
  medium: { variant: "yellow", label: "MED" },
  low: { variant: "gray", label: "LOW" },
};

const NewsItem = ({ item }: { readonly item: NewsResult }) => {
  const impact = impactConfig[item.impactLevel];

  return (
    <div className="group border-b border-card-border py-3 last:border-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <Badge variant={impact.variant}>{impact.label}</Badge>
            {item.relatedSymbols.map((sym) => (
              <Badge key={sym} variant="blue">{sym}</Badge>
            ))}
            <span className="text-[10px] text-muted">
              {format(new Date(item.publishedAt), "MMM d, HH:mm")}
            </span>
          </div>
          <h4 className="text-sm font-medium text-foreground">
            {item.title}
          </h4>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            {item.summary}
          </p>
        </div>
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-md p-1.5 text-muted opacity-0 transition-all hover:bg-hover-bg hover:text-foreground group-hover:opacity-100"
        >
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
};

const NewsFeed = ({ news }: NewsFeedProps) => {
  const sorted = [...news].sort((a, b) => b.relevanceScore - a.relevanceScore);

  return (
    <Card title="News Feed" titleRight={<span className="text-xs text-muted">Sorted by relevance</span>}>
      <div className="max-h-96 overflow-y-auto pr-1">
        {sorted.map((item) => (
          <NewsItem key={item.id} item={item} />
        ))}
      </div>
    </Card>
  );
};

export default NewsFeed;
