import type {
  AddSymbolRequest,
  AddSymbolResponse,
  DailyResearch,
  FeedbackRequest,
  RemoveSymbolResponse,
  ResearchHistoryItem,
  UpdateProfileRequest,
  UserFeedback,
  UserProfile,
  Watchlist,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

const jsonHeaders = {
  "Content-Type": "application/json",
} as const;

/**
 * Get the current Firebase ID token for authenticated requests.
 * Returns null if no user is signed in.
 */
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  // Dynamic import to avoid SSR issues
  const { getIdToken } = await import("./auth");
  const token = await getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const authHeaders = await getAuthHeaders();
  const response = await fetch(`${API_BASE}${url}`, {
    ...init,
    headers: {
      ...jsonHeaders,
      ...authHeaders,
      ...init?.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
};

// ===== Research =====

export const triggerResearch = (date?: string): Promise<DailyResearch> =>
  fetchJson("/v1/research", {
    method: "POST",
    body: JSON.stringify({ date }),
  });

export const getResearch = (researchId: string): Promise<DailyResearch> =>
  fetchJson(`/v1/research/${researchId}`);

export const getResearchHistory = async (): Promise<readonly ResearchHistoryItem[]> => {
  const result = await fetchJson<{ history: readonly ResearchHistoryItem[] }>("/v1/research/history");
  return result.history;
};

// ===== Watchlist =====

export const getWatchlist = (): Promise<Watchlist> =>
  fetchJson("/v1/watchlist");

export const addSymbol = (body: AddSymbolRequest): Promise<AddSymbolResponse> =>
  fetchJson("/v1/watchlist/symbols", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const removeSymbol = (symbol: string): Promise<RemoveSymbolResponse> =>
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

export const sendFeedback = (body: FeedbackRequest): Promise<UserFeedback> =>
  fetchJson("/v1/feedback", {
    method: "POST",
    body: JSON.stringify(body),
  });
