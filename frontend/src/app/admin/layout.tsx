"use client";

import type { ReactNode } from "react";
import { Center, Spinner, Text } from "@chakra-ui/react";
import { ThemeProvider } from "next-themes";
import { useAuth } from "@/lib/auth/AuthProvider";
import { t } from "@/lib/i18n";

/**
 * UX-ONLY gate for the admin UI. Next middleware cannot read the auth state
 * (tokens live in localStorage), so hiding happens here client-side — and it
 * is decoration either way: every /admin/* API request is independently
 * verified server-side by the AdminGuard (a fresh isAdmin DB read per
 * request). A non-admin who bypasses this component gets 403s and an empty
 * shell, never data.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    // Same pattern as EditorApp: next-themes mounts only inside app chrome.
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AdminGate>{children}</AdminGate>
    </ThemeProvider>
  );
}

function AdminGate({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();

  if (status === "loading") {
    return (
      <Center height="100vh">
        <Spinner size="lg" />
      </Center>
    );
  }

  if (status !== "authenticated" || !user?.isAdmin) {
    return (
      <Center height="100vh" bg="bg.muted">
        <Text color="fg.muted">{t.admin.denied}</Text>
      </Center>
    );
  }

  return <>{children}</>;
}
