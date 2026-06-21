"use client";

import { useCallback, useState } from "react";
import { useResumeStore } from "@/store/useResumeStore";

/**
 * Posts the current resume to the Puppeteer PDF route and triggers a browser
 * download of the returned A4 PDF. Exposes a generating flag so the trigger can
 * show progress and stay disabled while a render is in flight.
 */
export function useDownloadPdf() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = useCallback(async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setError(null);

    try {
      const resume = useResumeStore.getState().resume;
      const response = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume }),
      });

      if (!response.ok) {
        throw new Error(`PDF generation failed (${response.status})`);
      }

      const blob = await response.blob();
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
  }, [isGenerating]);

  return { download, isGenerating, error };
}
