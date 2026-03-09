"use client";

import { useState } from "react";
import { Search, Plus, X, Globe } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import type { Market, WatchlistItem } from "@/lib/types";
import { clsx } from "clsx";

type SymbolSearchProps = {
  readonly watchlistItems: readonly WatchlistItem[];
  readonly onAdd: (symbol: string, market: Market) => void;
  readonly onRemove: (symbol: string) => void;
  readonly maxItems?: number;
};

// Mock popular symbols for autocomplete
const popularSymbols: readonly { symbol: string; name: string; market: Market }[] = [
  { symbol: "AAPL", name: "Apple Inc.", market: "US" },
  { symbol: "GOOGL", name: "Alphabet Inc.", market: "US" },
  { symbol: "MSFT", name: "Microsoft Corp.", market: "US" },
  { symbol: "AMZN", name: "Amazon.com Inc.", market: "US" },
  { symbol: "NVDA", name: "NVIDIA Corp.", market: "US" },
  { symbol: "TSLA", name: "Tesla Inc.", market: "US" },
  { symbol: "META", name: "Meta Platforms", market: "US" },
  { symbol: "7203.T", name: "Toyota Motor", market: "JP" },
  { symbol: "6758.T", name: "Sony Group", market: "JP" },
  { symbol: "9984.T", name: "SoftBank Group", market: "JP" },
  { symbol: "6861.T", name: "Keyence Corp.", market: "JP" },
  { symbol: "8306.T", name: "MUFG", market: "JP" },
];

const SymbolSearch = ({
  watchlistItems,
  onAdd,
  onRemove,
  maxItems = 20,
}: SymbolSearchProps) => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const existingSymbols = watchlistItems.map((item) => item.symbol);

  const filteredSymbols = query.trim().length > 0
    ? popularSymbols.filter(
        (s) =>
          !existingSymbols.includes(s.symbol) &&
          (s.symbol.toLowerCase().includes(query.toLowerCase()) ||
            s.name.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const handleAdd = (symbol: string, market: Market) => {
    if (watchlistItems.length >= maxItems) return;
    onAdd(symbol, market);
    setQuery("");
    setShowSuggestions(false);
  };

  const capacityPercent = (watchlistItems.length / maxItems) * 100;

  return (
    <Card title="Symbol Search" titleRight={
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-800">
          <div
            className={clsx(
              "h-full rounded-full transition-all duration-500",
              capacityPercent > 80 ? "bg-amber-500/60" : "bg-blue-500/50"
            )}
            style={{ width: `${capacityPercent}%` }}
          />
        </div>
        <span className="font-mono text-[10px] text-slate-600">
          {watchlistItems.length}/{maxItems}
        </span>
      </div>
    }>
      {/* Search input */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search symbol or company name..."
          className="w-full rounded-xl border border-card-border bg-background/50 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-slate-600 transition-all duration-200 focus:border-blue-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
        />

        {/* Suggestions dropdown */}
        {showSuggestions && filteredSymbols.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-xl border border-card-border bg-card-bg-solid/95 shadow-2xl shadow-black/30 backdrop-blur-xl">
            {filteredSymbols.map((s) => (
              <button
                key={s.symbol}
                type="button"
                onClick={() => handleAdd(s.symbol, s.market)}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition-all duration-150 hover:bg-white/[0.03]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-400">
                    <Globe size={13} />
                  </div>
                  <div>
                    <span className="font-mono text-sm font-bold text-foreground tracking-wide">
                      {s.symbol}
                    </span>
                    <span className="ml-2 text-xs text-slate-500">{s.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={s.market === "US" ? "blue" : "purple"}>
                    {s.market}
                  </Badge>
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                    <Plus size={13} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current watchlist as cards */}
      <div className="mt-4 space-y-2">
        {watchlistItems.map((item, index) => (
          <div
            key={item.symbol}
            className={clsx(
              "animate-fade-in flex items-center justify-between rounded-xl border border-card-border/50 bg-white/[0.01] px-4 py-2.5 transition-all duration-200 hover:border-card-border",
              `delay-${Math.min(index * 75, 450)}`
            )}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800/50 font-mono text-[10px] font-bold text-slate-400">
                {item.market}
              </span>
              <span className="font-mono text-sm font-bold text-foreground tracking-wide">
                {item.symbol}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onRemove(item.symbol)}
              className="rounded-lg p-1.5 text-slate-700 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default SymbolSearch;
