"use client";

import { useEffect, useState } from "react";
import { Box, Button, Spinner } from "@chakra-ui/react";
import { DownloadIcon } from "@/components/ui/icons";
import { Tooltip } from "@/components/ui/Tooltip";
import { useDownloadPdf } from "@/hooks/resume/useDownloadPdf";
import { t } from "@/lib/i18n";
import { useResumeStore } from "@/store/useResumeStore";

/**
 * Icon + label download action. `useDownloadPdf` gates on auth first, then on
 * empty required fields. A blocked attempt fires a single validation toast
 * (bottom-left), paints the editor's per-field red highlights, and bumps
 * `emptyHighlightNonce` — this button watches that same nonce to turn solid red
 * and shake horizontally, so the button and the toast always fire together
 * (including on back-to-back blocked clicks with no other state change).
 */
export function DownloadButton() {
  const { download, isGenerating } = useDownloadPdf();
  // Bumped once per blocked attempt inside the same store action the hook fires
  // the toast from — subscribing here keeps the button in lockstep with the toast.
  const errorNonce = useResumeStore((state) => state.emptyHighlightNonce);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    if (errorNonce === 0) return; // initial mount — no attempt has happened yet
    setErrored(true);
    // Don't leave the button stuck red: settle back to neutral once the 0.4s
    // shake has played out (a later successful download clears the highlights
    // for real once every field is filled).
    const timer = setTimeout(() => setErrored(false), 500);
    return () => clearTimeout(timer);
  }, [errorNonce]);

  return (
    <Tooltip label={t.topbar.downloadResume}>
      <Button
        // Remount per nonce bump so the CSS shake restarts from frame 0 even on
        // consecutive blocked clicks — a plain class toggle would no-op when the
        // errored state hasn't changed between attempts.
        key={errorNonce}
        type="button"
        aria-label={t.topbar.downloadResume}
        onClick={download}
        disabled={isGenerating}
        rounded={"xl"}
        size={"sm"}
        fontSize={"xs"}
        // Solid red fill (error.solid) with an AA-legible white label/icon
        // (error.contrast) in both color modes; neutral when not errored.
        colorPalette={errored ? "error" : undefined}
        className={errored ? "rz-shake" : undefined}
      >
        {isGenerating ? <Spinner size="sm" /> : <DownloadIcon size={19} />}
        <Box as="span">{t.topbar.downloadResume}</Box>
      </Button>
    </Tooltip>
  );
}
