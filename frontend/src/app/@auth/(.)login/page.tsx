"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@chakra-ui/react";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { useAuth } from "@/lib/auth/AuthProvider";
import { t } from "@/lib/i18n";
import { cancelPendingDownload } from "@/lib/resume/pendingDownload";

/**
 * The intercepted /login: renders as a modal OVER the current page (soft
 * navigation only — a hard /login load gets app/login/page.tsx instead), so a
 * guest who hits the download gate never loses their editor context. On
 * success the modal pops itself; AuthGate then merges the guest resume and
 * resumes the pending download. Dismissing without signing in cancels the
 * remembered download intent.
 */
export default function LoginModal() {
  const { status } = useAuth();
  const router = useRouter();

  // The instant a session exists, pop the interception. The editor under the
  // modal stays exactly where it was.
  useEffect(() => {
    if (status === "authenticated") router.back();
  }, [status, router]);

  const dismiss = useCallback(() => {
    cancelPendingDownload();
    router.back();
  }, [router]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dismiss]);

  return (
    <Box
      role="dialog"
      aria-modal="true"
      aria-label={t.topbar.login}
      position="fixed"
      inset="0"
      zIndex="modal"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="blackAlpha.600"
      backdropFilter="blur(2px)"
      p="4"
      onClick={dismiss}
    >
      <Box onClick={(event) => event.stopPropagation()} width="100%" maxW="380px">
        <AuthScreen variant="embedded" />
      </Box>
    </Box>
  );
}
