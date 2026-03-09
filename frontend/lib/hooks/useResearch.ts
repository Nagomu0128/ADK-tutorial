"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { DailyResearch, AgentStatus } from "@/lib/types";
import * as api from "@/lib/api";

type UseResearchReturn = {
  readonly research: DailyResearch | null;
  readonly agentStatuses: readonly AgentStatus[];
  readonly isRunning: boolean;
  readonly error: string | null;
  readonly trigger: (date?: string) => Promise<void>;
};

const POLL_INTERVAL = 3000;

const useResearch = (): UseResearchReturn => {
  const [research, setResearch] = useState<DailyResearch | null>(null);
  const [agentStatuses, setAgentStatuses] = useState<readonly AgentStatus[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const pollResearch = useCallback(
    (researchId: string) => {
      pollRef.current = setInterval(async () => {
        try {
          const result = await api.getResearch(researchId);
          setAgentStatuses(result.agentStatuses);
          if (result.status === "completed" || result.status === "failed") {
            stopPolling();
            setResearch(result);
            setIsRunning(false);
          }
        } catch {
          // silently continue polling
        }
      }, POLL_INTERVAL);
    },
    [stopPolling]
  );

  const trigger = useCallback(
    async (date?: string) => {
      setIsRunning(true);
      setError(null);
      stopPolling();
      try {
        const result = await api.triggerResearch(date);
        setAgentStatuses(result.agentStatuses);
        if (result.status === "completed" || result.status === "failed") {
          setResearch(result);
          setIsRunning(false);
        } else {
          pollResearch(result.id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Research failed");
        setIsRunning(false);
      }
    },
    [stopPolling, pollResearch]
  );

  useEffect(() => stopPolling, [stopPolling]);

  return { research, agentStatuses, isRunning, error, trigger };
};

export default useResearch;
