"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  type UserProfile,
} from "@/lib/api/auth";
import { onUnauthorized } from "@/lib/api/client";
import { clearTokens, hasSession, setTokens } from "@/lib/api/tokens";
import { flushPendingWork } from "@/store/useResumeStore";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string, occupation?: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Adopt tokens obtained out-of-band (e.g. the Google OAuth redirect). */
  adoptSession: (accessToken: string, refreshToken: string) => Promise<void>;
  /**
   * Replace the cached profile with a fresher one (e.g. the response of a
   * profile PATCH), so consumers like the occupation prompt never re-fire off
   * stale data.
   */
  applyUser: (profile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<UserProfile | null>(null);

  const loadCurrentUser = useCallback(async () => {
    try {
      const profile = await getCurrentUser();
      setUser(profile);
      setStatus("authenticated");
    } catch {
      clearTokens();
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  // On mount, restore a session if tokens are present (skip the network call
  // entirely when there are none — e.g. the headless /print render). All state
  // updates happen inside the async helper, never synchronously in the effect.
  useEffect(() => {
    let active = true;
    const restore = async () => {
      if (!hasSession()) {
        if (active) setStatus("unauthenticated");
        return;
      }
      await loadCurrentUser();
    };
    void restore();
    return () => {
      active = false;
    };
  }, [loadCurrentUser]);

  // If a refresh fails mid-session, drop to the login screen.
  useEffect(
    () =>
      onUnauthorized(() => {
        clearTokens();
        setUser(null);
        setStatus("unauthenticated");
      }),
    [],
  );

  const login = useCallback(async (email: string, password: string) => {
    // Commit guest edits still inside a debounce window BEFORE the session
    // exists, so the post-login merge reads a complete guest document.
    flushPendingWork();
    const profile = await loginUser(email, password);
    setUser(profile);
    setStatus("authenticated");
  }, []);

  const register = useCallback(
    async (email: string, password: string, name?: string, occupation?: string) => {
      flushPendingWork();
      const profile = await registerUser(email, password, name, occupation);
      setUser(profile);
      setStatus("authenticated");
    },
    [],
  );

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const adoptSession = useCallback(
    async (accessToken: string, refreshToken: string) => {
      setTokens(accessToken, refreshToken);
      setStatus("loading");
      await loadCurrentUser();
    },
    [loadCurrentUser],
  );

  const applyUser = useCallback((profile: UserProfile) => {
    setUser(profile);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, login, register, logout, adoptSession, applyUser }),
    [status, user, login, register, logout, adoptSession, applyUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
