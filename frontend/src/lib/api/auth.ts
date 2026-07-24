import { API_BASE_URL } from "./config";
import { apiFetch, apiJson } from "./client";
import { clearTokens, setTokens } from "./tokens";

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  hasPassword: boolean;
  googleLinked: boolean;
  /** Display-only (admin nav visibility) — the backend AdminGuard is the boundary. */
  isAdmin: boolean;
  /**
   * Broad occupation category driving the resume's tailored example content
   * (see lib/occupationCategories.ts). Null = never chosen → the one-time
   * post-login prompt fires.
   */
  occupationCategory: string | null;
  createdAt: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse {
  user: UserProfile;
  tokens: AuthTokens;
}

export async function registerUser(
  email: string,
  password: string,
  name?: string,
  occupation?: string,
): Promise<UserProfile> {
  const data = await apiJson<AuthResponse>("/auth/register", {
    auth: false,
    method: "POST",
    // occupation is optional; omit the key entirely when unset so the backend
    // stores null rather than validating an empty string.
    body: JSON.stringify({ email, password, name, occupation: occupation || undefined }),
  });
  setTokens(data.tokens.accessToken, data.tokens.refreshToken);
  return data.user;
}

export async function loginUser(email: string, password: string): Promise<UserProfile> {
  const data = await apiJson<AuthResponse>("/auth/login", {
    auth: false,
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setTokens(data.tokens.accessToken, data.tokens.refreshToken);
  return data.user;
}

export function getCurrentUser(): Promise<UserProfile> {
  return apiJson<UserProfile>("/auth/me");
}

/**
 * Persist the account's occupation category (the write path behind the
 * one-time category prompt, the guest→account carry-over and the dashboard
 * selector). The id is validated server-side against the fixed list.
 */
export function updateOccupationCategory(occupationCategory: string): Promise<UserProfile> {
  return apiJson<UserProfile>("/auth/me", {
    method: "PATCH",
    body: JSON.stringify({ occupationCategory }),
  });
}

export async function logoutUser(): Promise<void> {
  // Best-effort server-side revoke; always clear local tokens regardless.
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } catch {
    /* ignore network errors on logout */
  }
  clearTokens();
}

/** Absolute URL that starts the Google OAuth flow (full-page navigation). */
export function googleLoginUrl(): string {
  return `${API_BASE_URL}/auth/google`;
}
