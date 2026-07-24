"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { useAuth } from "@/lib/auth/AuthProvider";

/**
 * The real /login page — the fallback for direct navigation, refreshes and
 * shared links (soft navigation from inside the app gets the intercepted
 * modal in app/@auth/(.)login instead). Once a session exists there is
 * nothing to do here: back to the editor, where AuthGate merges any guest
 * resume into the account.
 */
export default function LoginPage() {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.replace("/");
  }, [status, router]);

  return <AuthScreen />;
}
