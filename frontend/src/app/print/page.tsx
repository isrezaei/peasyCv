"use client";

import { Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getTemplate } from "@/components/resume/templates/registry";
import { useResumeDocument } from "@/hooks/store/useResumeDocument";
import { normalizeResume } from "@/lib/resume/normalizeResume";
import { useResumeStore } from "@/store/useResumeStore";

/**
 * Headless print surface for the Puppeteer PDF pipeline. It reads the resume
 * payload injected on `window.__RESUME_DATA__`, hydrates the store, and renders
 * the selected template through the *same* rendering layer as the live editor —
 * so the PDF matches the preview exactly. No editor chrome, ads, RightRail or
 * scroll container are rendered here; the remaining in-template affordances are
 * hidden by the `.no-print` rules under print media. `data-pdf-ready` signals
 * the route handler once content + fonts are settled.
 */
export default function PrintPage() {
  const isHydrated = useResumeStore((state) => state.isHydrated);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const data = window.__RESUME_DATA__;
    if (data) {
      // Update the external store directly from the injected payload.
      useResumeStore.getState().setResume(normalizeResume(data));
      useResumeStore.getState().setHydrated(true);
    }

    let cancelled = false;
    // Wait for web fonts so Persian glyphs are measured/painted before capture,
    // then two frames so the final layout (pagination) has committed. setReady
    // runs in an async callback, never synchronously inside the effect body.
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    void fontsReady.then(() => {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (!cancelled) setReady(true);
        }),
      );
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!isHydrated) return null;

  return <PrintDocument ready={ready} />;
}

function PrintDocument({ ready }: { ready: boolean }) {
  const resume = useResumeDocument();
  const Template = getTemplate(resume.templateId).component;

  return (
    <Box data-pdf-ready={ready ? "true" : "false"} width="210mm" mx="auto" bg="white">
      <Template resume={resume} theme={resume.theme} />
    </Box>
  );
}
