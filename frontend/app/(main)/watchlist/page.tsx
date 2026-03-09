"use client";

import { useState } from "react";
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
        <h1 className="mb-6 text-2xl font-bold text-foreground">
          Watchlist Management
        </h1>
        <p className="mb-8 text-sm text-muted">
          Add up to 20 stock symbols to your watchlist. Both US and Japanese
          stocks are supported. These symbols will be analyzed when you trigger
          daily research.
        </p>
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
