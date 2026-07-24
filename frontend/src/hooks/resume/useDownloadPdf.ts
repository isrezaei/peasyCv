"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { downloadResumePdf } from "@/lib/api/pdf";
import { useAuth } from "@/lib/auth/AuthProvider";
import { hasEmptyRequiredFields } from "@/lib/resume/emptyFields";
import {
  registerPendingDownloadHandler,
  requestDownloadAfterLogin,
} from "@/lib/resume/pendingDownload";
import { showValidationToast } from "@/lib/toast";
import { useResumeStore } from "@/store/useResumeStore";

/**
 * After a blocked download activates the highlights: replay the Download button's
 * one-shot shake on EVERY flagged field and bring the first one into view. The
 * validation pass has already stamped `data-empty-highlight` on every flagged
 * field; this runs after two frames so those markers have committed to the DOM.
 *
 * The shake reuses the button's exact mechanism — the shared globals.css
 * `.rz-shake` keyframe (transform-only, so it never shifts layout or pagination,
 * and auto-disabled under prefers-reduced-motion) applied via the same
 * remove → force-reflow → re-add trick, so a field flagged on a previous attempt
 * shakes again instead of staying still. All flagged fields shake together in the
 * same pass, alongside the button's own shake.
 */
function revealEmptyFields(): void {
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const fields = document.querySelectorAll<HTMLElement>('[data-empty-highlight="true"]');
      fields.forEach((el) => {
        el.classList.remove("rz-shake");
        void el.offsetWidth;
        el.classList.add("rz-shake");
      });
      fields[0]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }),
  );
}

/**
 * Requests a server-rendered A4 PDF of the current resume from the backend
 * (which renders it via the frontend's /print route with Puppeteer) and triggers
 * a browser download. Download is the ONE login-gated action: a guest is routed
 * to the /login modal and the click is remembered (pendingDownload), so after
 * login + guest-merge the download continues by itself. The backend enforces
 * the same gate server-side — POST /pdf rejects unauthenticated requests.
 */
export function useDownloadPdf() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { status } = useAuth();
  const router = useRouter();

  const download = useCallback(async () => {
    if (isGenerating) return;

    // Auth gate FIRST: a guest sees the login sheet, never the validation
    // feedback. After login the pending-download handler re-runs this callback,
    // now authenticated, and the empty-field validation below finally runs.
    if (status !== "authenticated") {
      requestDownloadAfterLogin();
      router.push("/login");
      return;
    }

    const store = useResumeStore.getState();
    const resume = store.resume;

    // Empty-field validation: block the download when an enabled required field
    // is blank, turn on the editor highlights (+ replay the shake on the button
    // and on every flagged field), and scroll the first flagged field into view.
    // Nothing is generated until every enabled field is filled.
    if (hasEmptyRequiredFields(resume)) {
      store.activateEmptyHighlights();
      revealEmptyFields();
      // One short, generic warning toast (single id → no stacking on repeat
      // clicks). It never names the fields — the red highlights above do that.
      showValidationToast();
      return;
    }
    store.clearEmptyHighlights();

    setIsGenerating(true);
    setError(null);

    try {
      const blob = await downloadResumePdf(resume);

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${resume.title?.trim() || "resume"}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, status, router]);

  // Let AuthGate re-trigger a download that was interrupted by the login gate.
  useEffect(() => registerPendingDownloadHandler(() => void download()), [download]);

  return { download, isGenerating, error };
}
