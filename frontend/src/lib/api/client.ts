// Thin fetch wrapper: attaches the bearer token, retries exactly once on
// a 401 by rotating the refresh token, and throws a typed ApiError with
// the backend's `detail` message so components can show it directly
// instead of a generic "something went wrong."
//
// Tokens live in memory + localStorage (a real deployed app, not a
// claude.ai artifact — browser storage is the normal, correct choice
// here). In-memory is the source of truth during a session; localStorage
// only exists so a page refresh doesn't sign the person out.

const STORAGE_KEY = "quantaliez_auto_tokens";

interface StoredTokens {
  access_token: string;
  refresh_token: string;
}

let tokens: StoredTokens | null = null;
try {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) tokens = JSON.parse(raw);
} catch {
  tokens = null;
}

type Listener = (tokens: StoredTokens | null) => void;
const listeners = new Set<Listener>();

export function subscribeToAuthChanges(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setTokens(next: StoredTokens | null) {
  tokens = next;
  if (next) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
  listeners.forEach((fn) => fn(tokens));
}

export function getAccessToken(): string | null {
  return tokens?.access_token ?? null;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let refreshInFlight: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (!tokens?.refresh_token) return false;
  // Multiple concurrent 401s (e.g. a page firing several queries at
  // once) should trigger exactly one refresh call, not one per request
  // — everyone awaits the same in-flight promise.
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch("/api/v1/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: tokens!.refresh_token }),
        });
        if (!res.ok) {
          setTokens(null);
          return false;
        }
        const data = await res.json();
        setTokens({ access_token: data.access_token, refresh_token: data.refresh_token });
        return true;
      } catch {
        setTokens(null);
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  isForm?: boolean;
  skipAuthRetry?: boolean;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, isForm = false, skipAuthRetry = false } = options;

  const headers: Record<string, string> = {};
  const accessToken = getAccessToken();
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";

  const res = await fetch(`/api/v1${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
  });

  if (res.status === 401 && !skipAuthRetry && tokens?.refresh_token) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return apiRequest<T>(path, { ...options, skipAuthRetry: true });
    }
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json") ? await res.json() : null;

  if (!res.ok) {
    const message = (data && (data.detail || data.message)) || `Request failed (${res.status})`;
    throw new ApiError(res.status, typeof message === "string" ? message : JSON.stringify(message));
  }

  return data as T;
}

export function buildQuery(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
