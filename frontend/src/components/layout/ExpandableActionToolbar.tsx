"use client";

import { HStack } from "@chakra-ui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdModal } from "@/components/ads/AdModal";
import { pickAdModalId } from "@/components/ads/adIds";
import { ShareDialog } from "@/components/layout/ShareDialog";
import { DotsIcon, EyeIcon, ShareIcon } from "@/components/ui/icons";
import { useAuth } from "@/lib/auth/AuthProvider";
import { t } from "@/lib/i18n";
import { ToolButton } from "./ToolButton";

// Width of the two 44px buttons + the 5px gap between them, so the collapse
// animates to/from an exact pixel value instead of jumping (no ResizeObserver
// needed since the expanded content is fixed).
const EXPANDED_WIDTH = "93px";

/**
 * The former left floating rail's Preview + Share actions, embedded directly
 * inside the centre tool dock behind a Figma/Notion-style "More" toggle.
 * Expanded by default so the common actions are visible on load; collapses to
 * just the dots button. Renders no shell of its own — it inherits the dock's
 * glass pill, so expanding grows the dock itself.
 */
export function ExpandableActionToolbar() {
  const [expanded, setExpanded] = useState(true);
  const [adOpen, setAdOpen] = useState(false);
  const [adId, setAdId] = useState(() => pickAdModalId());
  const [shareOpen, setShareOpen] = useState(false);
  const { status } = useAuth();
  const router = useRouter();

  // Pick a fresh random ad each time the preview modal is opened.
  const openPreview = () => {
    setAdId(pickAdModalId());
    setAdOpen(true);
  };

  // Sharing needs an account (the backend rejects guest share requests with a
  // 401), so a guest goes to the login sheet — the same gate the download button
  // uses — instead of opening a dialog whose only outcome is a doomed request.
  const openShare = () => {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }
    setShareOpen(true);
  };

  return (
    <HStack gap={expanded ? "5px" : "0px"} transition="gap .25s ease">
      <HStack
        gap={expanded ? "5px" : "0px"}
        maxWidth={expanded ? EXPANDED_WIDTH : "0px"}
        opacity={expanded ? 1 : 0}
        overflow="hidden"
        transition="max-width .25s cubic-bezier(0.4, 0, 0.2, 1), opacity .2s ease, gap .25s ease"
        aria-hidden={!expanded}
      >
        <ToolButton label={t.topbar.preview} icon={<EyeIcon size={20} />} onClick={openPreview} />
        <ToolButton label={t.topbar.share} icon={<ShareIcon size={20} />} onClick={openShare} />
      </HStack>
      <ToolButton
        label={t.topbar.more}
        icon={<DotsIcon size={20} />}
        active={expanded}
        onClick={() => setExpanded((value) => !value)}
      />

      <AdModal open={adOpen} adId={adId} onClose={() => setAdOpen(false)} />
      <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} />
    </HStack>
  );
}
