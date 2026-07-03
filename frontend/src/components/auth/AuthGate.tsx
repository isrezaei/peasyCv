"use client";

import { useEffect, type ReactNode } from "react";
import { Center, Spinner } from "@chakra-ui/react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { hydrateResumeStore, startAutosave } from "@/store/useResumeStore";
import { AuthScreen } from "./AuthScreen";

/**
 * Gates the editor behind authentication. While the session is being restored a
 * spinner shows; an unauthenticated visitor sees the login/register screen; an
 * authenticated user gets the editor, with resume hydration + autosave wired to
 * the API only once they are signed in (so the headless /print render and the
 * login screen never hit the authenticated endpoints).
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <Center height="100vh">
        <Spinner size="lg" />
      </Center>
    );
  }

  if (status === "unauthenticated") {
    return <AuthScreen />;
  }

  return <AuthenticatedApp>{children}</AuthenticatedApp>;
}

function AuthenticatedApp({ children }: { children: ReactNode }) {
  useEffect(() => {
    void hydrateResumeStore();
    const stopAutosave = startAutosave();
    return stopAutosave;
  }, []);

  return <>{children}</>;
}
