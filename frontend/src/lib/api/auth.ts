import { API_BASE_URL } from "./config";
import { apiFetch, apiJson } from "./client";
import { clearTokens, setTokens } from "./tokens";

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  hasPassword: boolean;
  googleLinked: boolean;
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
): Promise<UserProfile> {
  const data = await apiJson<AuthResponse>("/auth/register", {
    auth: false,
    method: "POST",
    body: JSON.stringify({ email, password, name }),
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
