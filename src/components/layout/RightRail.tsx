"use client";

import { IconButton, Spinner, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { AdModal } from "@/components/ads/AdModal";
import { pickAdModalId } from "@/components/ads/adIds";
import { DownloadIcon, EyeIcon, ShareIcon } from "@/components/ui/icons";
import { Tooltip } from "@/components/ui/Tooltip";
import { useDownloadPdf } from "@/hooks/resume/useDownloadPdf";
import { COLORS } from "@/lib/design/tokens";
import { t } from "@/lib/i18n";

// 40px circular action button: exact rail shadow, indigo hover (see SHADOWS.rail).
const railButton = {
  width: "40px",
  height: "40px",
  borderRadius: "full",
  variant: "solid",
  bg: "white",
  fontSize: "18px",
  boxShadow: "rail",
  style: { color: COLORS.ink600 },
  _hover: { bg: "white", color: "accent.solid", boxShadow: "railHover" },
} as const;

export function RightRail() {
  const [adOpen, setAdOpen] = useState(false);
  const [adId, setAdId] = useState(() => pickAdModalId());
  const { download, isGenerating } = useDownloadPdf();

  // Pick a fresh random ad each time the modal is opened.
  const openAd = () => {
    setAdId(pickAdModalId());
    setAdOpen(true);
  };

  // Kept on the inline-end (left in RTL) so it doesn't collide with the
  // right-docked side panel; the mock floats it past a free-floating panel.
  return (
    <VStack className="no-print" position="absolute" insetInlineEnd="22px" top="24px" gap="10px" zIndex={20}>
      <Tooltip label={t.topbar.preview}>
        <IconButton aria-label={t.topbar.preview} {...railButton} onClick={openAd}>
          <EyeIcon />
        </IconButton>
      </Tooltip>
      <Tooltip label={t.topbar.download}>
        <IconButton
          aria-label={t.topbar.download}
          {...railButton}
          loading={isGenerating}
          disabled={isGenerating}
          onClick={download}
        >
          {isGenerating ? <Spinner size="sm" /> : <DownloadIcon />}
        </IconButton>
      </Tooltip>
      <Tooltip label={t.topbar.share}>
        <IconButton aria-label={t.topbar.share} {...railButton} onClick={openAd}>
          <ShareIcon />
        </IconButton>
      </Tooltip>
      <AdModal open={adOpen} adId={adId} onClose={() => setAdOpen(false)} />
    </VStack>
  );
}
