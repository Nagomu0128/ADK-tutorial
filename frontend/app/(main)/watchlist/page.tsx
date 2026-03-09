"use client";

import { useState } from "react";
import { List } from "lucide-react";
import Header from "@/components/layout/Header";
import SymbolSearch from "@/components/watchlist/SymbolSearch";
import StockList from "@/components/dashboard/StockList";
import { mockWatchlistItems, mockStockResults } from "@/lib/mock-data";
import type { Market, WatchlistItem } from "@/lib/types";

const WatchlistPage = () => {
  const [items, setItems] = useState<readonly WatchlistItem[]>(mockWatchlistItems);

  const handleAdd = (symbol: string, market: Market) => {
    const newItem: WatchlistItem = {
      symbol,
      market,
      addedAt: new Date().toISOString(),
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleRemove = (symbol: string) => {
    setItems((prev) => prev.filter((item) => item.symbol !== symbol));
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="p-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-400 ring-1 ring-emerald-500/20">
            <List size={18} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Watchlist Management
            </h1>
            <p className="text-sm text-slate-500">
              Add up to 20 stock symbols. Both US and Japanese stocks supported.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SymbolSearch
            watchlistItems={items}
            onAdd={handleAdd}
            onRemove={handleRemove}
          />
          <StockList stocks={mockStockResults} />
        </div>
      </div>
    </div>
  );
};

export default WatchlistPage;
