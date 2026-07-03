"use client";

import { useEffect, useState } from "react";
import { Center, Spinner, Text } from "@chakra-ui/react";
import { setTokens } from "@/lib/api/tokens";

/**
 * Landing route for the Google OAuth redirect. The backend appends the issued
 * tokens to the URL fragment (#accessToken=…&refreshToken=…) — read here (the
 * fragment never reaches a server/log), persisted, then we hard-navigate to the
 * editor so the AuthProvider restores the session cleanly.
 */
export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const fragment = window.location.hash.replace(/^#/, "");
      const params = new URLSearchParams(fragment);
      const accessToken = params.get("accessToken");
      const refreshToken = params.get("refreshToken");

      if (accessToken && refreshToken) {
        setTokens(accessToken, refreshToken);
        window.location.replace("/");
        return;
      }
      setError("ورود با گوگل ناموفق بود. دوباره تلاش کنید.");
    };
    void run();
  }, []);

  return (
    <Center height="100vh">
      {error ? <Text color="red.500">{error}</Text> : <Spinner size="lg" />}
    </Center>
  );
}
