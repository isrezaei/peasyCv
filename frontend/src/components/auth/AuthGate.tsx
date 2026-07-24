"use client";

import { useEffect, type ReactNode } from "react";
import { Center, Spinner } from "@chakra-ui/react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { mergeGuestResume } from "@/lib/resume/guestMerge";
import { firePendingDownload } from "@/lib/resume/pendingDownload";
import { hydrateResumeStore, startAutosave } from "@/store/useResumeStore";

/**
 * Wires resume hydration + autosave around the auth state. The editor is fully
 * usable WITHOUT an account: a guest gets the seeded default resume persisted
 * to localStorage; only the PDF download asks for a login (the top bar's
 * download button routes to the /login modal). While the session restores,
 * a spinner shows; after that the editor always renders — `key={status}` remounts the session whenever
 * auth flips so the store re-hydrates from the right backing store (guest
 * localStorage vs the API) and a login first merges the guest resume into the
 * account as a new resume.
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

  return (
    <ResumeSession key={status} authenticated={status === "authenticated"}>
      {children}
    </ResumeSession>
  );
}

function ResumeSession({
  authenticated,
  children,
}: {
  authenticated: boolean;
  children: ReactNode;
}) {
  useEffect(() => {
    let stop: (() => void) | null = null;
    let cancelled = false;

    void (async () => {
      // Merge BEFORE hydrating: the merged resume becomes the account's most
      // recently updated document, so hydration lands on it and the user keeps
      // editing exactly what they built as a guest.
      let mergedId: string | null = null;
      if (authenticated) {
        try {
          mergedId = (await mergeGuestResume())?.id ?? null;
        } catch (error) {
          // A failed merge must not block the editor. The guest key is only
          // cleared on success, so the merge simply re-runs on the next login.
          // Surface it though: a silent failure here is exactly what makes the
          // editor land on a fallback resume instead of the guest's work, so it
          // must be diagnosable rather than invisible.
          console.error("Guest resume merge failed; keeping guest key for retry.", error);
        }
      }
      // The dashboard opens a specific resume via /?resume=<id>. Read from
      // location (not useSearchParams) — this all runs client-side and the
      // page must not need a Suspense boundary for it.
      const fromUrl = authenticated
        ? new URLSearchParams(window.location.search).get("resume")
        : null;
      await hydrateResumeStore(fromUrl ?? mergedId);
      // Autosave subscribes only after hydration, so the initial setResume is
      // never echoed back into storage — a mere visit must not create the
      // guest key (that key existing is what "there is guest work" means).
      if (!cancelled) {
        stop = startAutosave();
        // A download interrupted by the login gate continues here — after the
        // merge and hydration, so it renders exactly what the guest built.
        if (authenticated) firePendingDownload();
      }
    })();

    return () => {
      cancelled = true;
      stop?.();
    };
  }, [authenticated]);

  return <>{children}</>;
}
