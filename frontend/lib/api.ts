import type {
  AddSymbolRequest,
  DailyResearch,
  FeedbackRequest,
  ResearchHistoryItem,
  UpdateProfileRequest,
  UserProfile,
  Watchlist,
  AgentStatus,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

const jsonHeaders = {
  "Content-Type": "application/json",
} as const;

const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE}${url}`, {
    ...init,
    headers: {
      ...jsonHeaders,
      ...init?.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
};

// ===== Research =====

export const triggerResearch = (): Promise<DailyResearch> =>
  fetchJson("/v1/research", { method: "POST" });

export const getResearch = (researchId: string): Promise<DailyResearch> =>
  fetchJson(`/v1/research/${researchId}`);

export const getResearchStatus = (researchId: string): Promise<{ agentStatuses: readonly AgentStatus[] }> =>
  fetchJson(`/v1/research/${researchId}/status`);

export const getResearchHistory = (): Promise<readonly ResearchHistoryItem[]> =>
  fetchJson("/v1/research/history");

// ===== Watchlist =====

export const getWatchlist = (): Promise<Watchlist> =>
  fetchJson("/v1/watchlist");

export const addSymbol = (body: AddSymbolRequest): Promise<Watchlist> =>
  fetchJson("/v1/watchlist/symbols", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const removeSymbol = (symbol: string): Promise<void> =>
  fetchJson(`/v1/watchlist/symbols/${encodeURIComponent(symbol)}`, {
    method: "DELETE",
  });

// ===== Profile =====

export const getProfile = (): Promise<UserProfile> =>
  fetchJson("/v1/profile");

export const updateProfile = (body: UpdateProfileRequest): Promise<UserProfile> =>
  fetchJson("/v1/profile", {
    method: "PUT",
    body: JSON.stringify(body),
  });

// ===== Feedback =====

export const sendFeedback = (body: FeedbackRequest): Promise<void> =>
  fetchJson("/v1/feedback", {
    method: "POST",
    body: JSON.stringify(body),
  });
