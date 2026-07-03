/**
 * Client-side token storage. The access token is attached as a Bearer header on
 * every API call; the refresh token is exchanged for a new pair when the access
 * token expires. Stored in localStorage so the session survives reloads.
 */
const ACCESS_KEY = "ai-res:accessToken";
const REFRESH_KEY = "ai-res:refreshToken";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_KEY, accessToken);
  window.localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
}

export function hasSession(): boolean {
  return Boolean(getAccessToken() && getRefreshToken());
}
