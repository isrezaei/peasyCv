"use client";

import { useCallback, useState } from "react";
import { downloadResumePdf } from "@/lib/api/pdf";
import { useResumeStore } from "@/store/useResumeStore";

/**
 * Requests a server-rendered A4 PDF of the current resume from the backend
 * (which renders it via the frontend's /print route with Puppeteer) and triggers
 * a browser download. Exposes a generating flag so the trigger can show progress
 * and stay disabled while a render is in flight.
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
  }, [isGenerating]);

  return { download, isGenerating, error };
}
