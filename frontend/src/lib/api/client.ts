import { API_BASE_URL } from "./config";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "./tokens";

/**
 * Central fetch wrapper for the backend API. Responsibilities:
 *  - prefix the API base URL
 *  - attach the Bearer access token (unless `auth: false`)
 *  - set JSON content-type for plain-object bodies (never for FormData)
 *  - transparently refresh the access token once on a 401 and retry
 *  - on an unrecoverable 401, clear the session and notify listeners (logout)
 */
export interface ApiFetchOptions extends RequestInit {
  /** Attach the access token. Default true. */
  auth?: boolean;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type UnauthorizedHandler = () => void;
const unauthorizedHandlers = new Set<UnauthorizedHandler>();

/** Register a callback fired when the session can no longer be refreshed. */
export function onUnauthorized(handler: UnauthorizedHandler): () => void {
  unauthorizedHandlers.add(handler);
  return () => unauthorizedHandlers.delete(handler);
}

function notifyUnauthorized(): void {
  for (const handler of unauthorizedHandlers) handler();
}

// Coalesce concurrent refreshes into a single in-flight request.
let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) {
          clearTokens();
          return false;
        }
        const data = (await res.json()) as { accessToken: string; refreshToken: string };
        setTokens(data.accessToken, data.refreshToken);
        return true;
      } catch {
        return false;
      }
    })();
  }

  const ok = await refreshInFlight;
  refreshInFlight = null;
  return ok;
}

export async function apiFetch(path: string, options: ApiFetchOptions = {}): Promise<Response> {
  const { auth = true, headers, body, ...rest } = options;

  const run = async (): Promise<Response> => {
    const h = new Headers(headers);
    if (auth) {
      const token = getAccessToken();
      if (token) h.set("Authorization", `Bearer ${token}`);
    }
    // JSON content-type for plain bodies only — never override FormData's own.
    if (body && !(body instanceof FormData) && !h.has("Content-Type")) {
      h.set("Content-Type", "application/json");
    }
    return fetch(`${API_BASE_URL}${path}`, { ...rest, headers: h, body });
  };

  let response = await run();
  if (response.status === 401 && auth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      response = await run();
    } else {
      notifyUnauthorized();
    }
  }
  return response;
}

/** apiFetch + JSON parsing + error throwing. Returns null for 204/empty bodies. */
export async function apiJson<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const response = await apiFetch(path, options);
  if (!response.ok) {
    throw new ApiError(response.status, await extractErrorMessage(response));
  }
  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string | string[]; error?: string };
    if (Array.isArray(data.message)) return data.message.join(", ");
    return data.message ?? data.error ?? `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}
