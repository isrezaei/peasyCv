"use client";

import { useEffect, useRef, useState } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { AdModal } from "./AdModal";
import { pickAdModalId } from "./adIds";

/** Open the ad modal on every Nth genuine template switch. */
const SWITCHES_PER_AD = 5;

/**
 * Opens the advertisement modal on every FIFTH template switch. It watches the
 * real `templateId` value, so it counts only genuine changes (re-selecting the
 * current template, or the one-time hydration assignment, never count) — and it
 * owns no resume data, so it can never disturb the template-switch flow itself
 * (switching templates still keeps every field intact). Each modal shows one
 * randomly chosen ad. Mounted in the editor shell only, so it stays out of the PDF.
 */
export function TemplateSwitchAd() {
  const templateId = useResumeStore((state) => state.resume.templateId);
  const isHydrated = useResumeStore((state) => state.isHydrated);

  const baseline = useRef<string | null>(null);
  const switchCount = useRef(0);
  const [open, setOpen] = useState(false);
  const [adId, setAdId] = useState(() => pickAdModalId());

  useEffect(() => {
    // Don't track until the persisted document has settled; the first hydrated
    // value is the baseline, not a switch.
    if (!isHydrated) return;
    if (baseline.current === null) {
      baseline.current = templateId;
      return;
    }
    if (baseline.current === templateId) return;
    baseline.current = templateId;
    switchCount.current += 1;
    if (switchCount.current % SWITCHES_PER_AD === 0) {
      setAdId(pickAdModalId());
      setOpen(true);
    }
  }, [templateId, isHydrated]);

  return <AdModal open={open} adId={adId} onClose={() => setOpen(false)} />;
}
