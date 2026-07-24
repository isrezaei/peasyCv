"use client";

import { Box, HStack } from "@chakra-ui/react";
import type { CSSProperties } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdModal } from "@/components/ads/AdModal";
import { pickAdModalId } from "@/components/ads/adIds";
import { useActivePanel } from "@/hooks/store/useActivePanel";
import { useSidebar } from "@/hooks/store/useSidebar";
import { useAuth } from "@/lib/auth/AuthProvider";
import { DOCK, DOCK_RADII, DOCK_SHADOWS } from "@/lib/design/tokens";
import { t } from "@/lib/i18n";
import type { ActivePanel } from "@/store/types";
import { ColorModeButton } from "./ColorModeButton";
import { DockToggleButton } from "./DockToggleButton";
import { AssistantGlyph, DesignGlyph, ReviewGlyph, SectionsGlyph, TemplatesGlyph, TextGlyph } from "./dockIcons";
import { DownloadButton } from "./DownloadButton";
import { ExpandableActionToolbar } from "./ExpandableActionToolbar";
import { MobileToolMenu } from "./MobileToolMenu";
import { SaveStatusIndicator } from "./SaveStatusIndicator";
import { ToolButton } from "./ToolButton";
import { UserMenu } from "./UserMenu";

// Frosted-glass shell shared by the centre tool dock and the end cluster.
const glass = (radius: string, shadow: string): CSSProperties => ({
  borderRadius: radius,
  border: `1px solid ${DOCK.border}`,
  backdropFilter: DOCK.blur,
  WebkitBackdropFilter: DOCK.blur,
  boxShadow: shadow,
});

/**
 * The topbar, rebuilt as the imported "Topbar Dock": a transparent strip with
 * three floating glass clusters. RTL start (far right) = side-panel toggle,
 * centre = the icon-only tool dock, RTL end (far left) = save status + avatar.
 * All existing actions stay wired; only the presentation changed.
 */
export function TopBar() {
  const { activePanel, setActivePanel } = useActivePanel();
  const { collapsed, setCollapsed } = useSidebar();
  const [adOpen, setAdOpen] = useState(false);
  const [adId, setAdId] = useState(() => pickAdModalId());
  const { status } = useAuth();
  const router = useRouter();
  // The AI actions (review/improve/assistant) are account features: a guest is
  // sent to the login sheet — the same gate as download/share — so the buttons
  // are never silent no-ops. Authenticated clicks keep the existing ad-modal
  // behavior (which the kill switch may suppress); picks a fresh ad per open.
  const openAd = () => {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }
    setAdId(pickAdModalId());
    setAdOpen(true);
  };

  // Clicking the active tool toggles the panel; clicking another switches to it
  // and makes sure the panel is open.
  const handleTool = (panel: ActivePanel) => {
    if (activePanel === panel) {
      setCollapsed(!collapsed);
    } else {
      setActivePanel(panel);
      setCollapsed(false);
    }
  };
  const isPanelActive = (panel: ActivePanel) => activePanel === panel && !collapsed;

  return (
    <HStack
      as="header"
      className="no-print"
      align="center"
      gap={{ base: "8px", lg: "16px" }}
      px={{ base: "12px", lg: "22px" }}
      py={{ base: "10px", lg: "18px" }}
      flexShrink={0}
    >
      {/* RTL start (far right): side-panel toggle + download. */}
      <DockToggleButton />
      <DownloadButton />

      {/* Centre: icon-only tool dock (desktop only; below `lg` the actions move
          into the MobileToolMenu). The flex wrapper stays as a spacer on mobile so
          the end cluster is pushed to the RTL end. */}
      <HStack flex="1" justify="center">
        <HStack
          display={{ base: "none", lg: "flex" }}
          gap="5px"
          p="7px"
          bg={DOCK.glassBg}
          color={DOCK.idleFg}
          style={glass(DOCK_RADII.center, DOCK_SHADOWS.center)}
        >
          <ToolButton
            label={t.topbar.design}
            icon={<DesignGlyph />}
            active={isPanelActive("design")}
            onClick={() => handleTool("design")}
          />
          <ToolButton
            label={t.topbar.templates}
            icon={<TemplatesGlyph />}
            active={isPanelActive("templates")}
            onClick={() => handleTool("templates")}
          />
          <ToolButton
            label={t.topbar.rearrange}
            icon={<SectionsGlyph />}
            active={isPanelActive("rearrange")}
            onClick={() => handleTool("rearrange")}
          />
          <ToolButton
            label={t.topbar.checkTailor}
            icon={<ReviewGlyph />}
            onClick={openAd}
          />
          <ToolButton
            label={t.topbar.improveText}
            icon={<TextGlyph />}
            onClick={openAd}
          />
          <ToolButton
            label={t.topbar.aiAssistant}
            icon={<AssistantGlyph />}
            onClick={openAd}
          />
          {/* Expandable "More" toolbar: former rail's Preview + Share actions.
              Lives inside the dock, so expanding it grows the dock itself. */}
          <ExpandableActionToolbar />
        </HStack>
      </HStack>

      {/* RTL end (far left): save status + color mode + user avatar menu. Below
          `lg` the save indicator and the color-mode cycle fold into the mobile
          overflow menu; the avatar stays, and the compact «بیشتر» menu appears. */}
      <HStack flex="none" gap="4px" p="6px" bg={DOCK.glassBg} style={glass(DOCK_RADII.save, DOCK_SHADOWS.side)}>
        <Box display={{ base: "none", lg: "flex" }}>
          <SaveStatusIndicator />
        </Box>
        <Box display={{ base: "flex", lg: "none" }}>
          <MobileToolMenu />
        </Box>
        <Box display={{ base: "none", lg: "flex" }}>
          <ColorModeButton />
        </Box>
        <Box display={{ base: "none", lg: "block" }} width="1px" height="22px" bg={DOCK.divider} />
        <UserMenu />
      </HStack>

      <AdModal open={adOpen} adId={adId} onClose={() => setAdOpen(false)} />
    </HStack>
  );
}
