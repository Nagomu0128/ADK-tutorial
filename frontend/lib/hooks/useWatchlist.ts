"use client";

import { useState, useCallback, useEffect } from "react";
import type { Watchlist, Market } from "@/lib/types";
import * as api from "@/lib/api";

type UseWatchlistReturn = {
  readonly watchlist: Watchlist | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly addSymbol: (symbol: string, market: Market) => Promise<void>;
  readonly removeSymbol: (symbol: string) => Promise<void>;
  readonly refresh: () => Promise<void>;
};

const useWatchlist = (): UseWatchlistReturn => {
  const [watchlist, setWatchlist] = useState<Watchlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const result = await api.getWatchlist();
      setWatchlist(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load watchlist");
    } finally {
      setLoading(false);
    }
  }, []);

  const addSymbol = useCallback(
    async (symbol: string, market: Market) => {
      try {
        await api.addSymbol({ symbol, market });
        // Refresh full watchlist after add
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add symbol");
      }
    },
    [refresh]
  );

  const removeSymbol = useCallback(
    async (symbol: string) => {
      try {
        await api.removeSymbol(symbol);
        // Refresh full watchlist after remove
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to remove symbol");
      }
    },
    [refresh]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { watchlist, loading, error, addSymbol, removeSymbol, refresh };
};

export default useWatchlist;
