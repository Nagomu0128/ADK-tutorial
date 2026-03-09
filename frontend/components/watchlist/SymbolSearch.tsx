"use client";

import { useState } from "react";
import { Search, Plus, X } from "lucide-react";
import Button from "@/components/ui/Button";
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

  return (
    <Card title="Symbol Search" titleRight={
      <span className="text-xs text-muted">
        {watchlistItems.length}/{maxItems} symbols
      </span>
    }>
      {/* Search input */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search symbol or company name..."
          className="w-full rounded-lg border border-card-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-slate-600 focus:border-accent-blue focus:outline-none"
        />

        {/* Suggestions dropdown */}
        {showSuggestions && filteredSymbols.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-card-border bg-sidebar-bg shadow-xl">
            {filteredSymbols.map((s) => (
              <button
                key={s.symbol}
                type="button"
                onClick={() => handleAdd(s.symbol, s.market)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-hover-bg"
              >
                <div>
                  <span className="font-mono text-sm font-semibold text-foreground">
                    {s.symbol}
                  </span>
                  <span className="ml-2 text-xs text-muted">{s.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={s.market === "US" ? "blue" : "purple"}>
                    {s.market}
                  </Badge>
                  <Plus size={14} className="text-accent-blue" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current watchlist */}
      <div className="mt-4 space-y-1.5">
        {watchlistItems.map((item) => (
          <div
            key={item.symbol}
            className="flex items-center justify-between rounded-lg border border-card-border px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-foreground">
                {item.symbol}
              </span>
              <Badge variant={item.market === "US" ? "blue" : "purple"}>
                {item.market}
              </Badge>
            </div>
            <button
              type="button"
              onClick={() => onRemove(item.symbol)}
              className={clsx(
                "rounded-md p-1 text-slate-600 transition-colors",
                "hover:bg-red-500/10 hover:text-red-400"
              )}
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
