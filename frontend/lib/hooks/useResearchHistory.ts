"use client";

import { useState, useCallback, useEffect } from "react";
import type { ResearchHistoryItem } from "@/lib/types";
import * as api from "@/lib/api";

type UseResearchHistoryReturn = {
  readonly history: readonly ResearchHistoryItem[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly refresh: () => Promise<void>;
};

const useResearchHistory = (): UseResearchHistoryReturn => {
  const [history, setHistory] = useState<readonly ResearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const result = await api.getResearchHistory();
      setHistory(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { history, loading, error, refresh };
};

export default useResearchHistory;
