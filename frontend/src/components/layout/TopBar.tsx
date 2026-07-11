"use client";

import { Box, HStack } from "@chakra-ui/react";
import type { CSSProperties } from "react";
import { useState } from "react";
import { AdModal } from "@/components/ads/AdModal";
import { pickAdModalId } from "@/components/ads/adIds";
import { useActivePanel } from "@/hooks/store/useActivePanel";
import { useSidebar } from "@/hooks/store/useSidebar";
import { DOCK, DOCK_RADII, DOCK_SHADOWS } from "@/lib/design/tokens";
import { t } from "@/lib/i18n";
import type { ActivePanel } from "@/store/types";
import { ColorModeButton } from "./ColorModeButton";
import { DockToggleButton } from "./DockToggleButton";
import {
  AssistantGlyph,
  AvatarGlyph,
  DesignGlyph,
  ReviewGlyph,
  SectionsGlyph,
  TemplatesGlyph,
  TextGlyph,
} from "./dockIcons";
import { SaveStatusIndicator } from "./SaveStatusIndicator";
import { ToolButton } from "./ToolButton";

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
  // Pick a fresh random ad each time the modal is opened.
  const openAd = () => {
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
      gap="16px"
      px="22px"
      py="18px"
      flexShrink={0}
    >
      {/* RTL start (far right): side-panel toggle. */}
      <DockToggleButton />

      {/* Centre: icon-only tool dock. */}
      <HStack flex="1" justify="center">
        <HStack
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
        </HStack>
      </HStack>

      {/* RTL end (far left): save status + color mode + avatar. */}
      <HStack flex="none" gap="4px" p="6px" bg={DOCK.glassBg} style={glass(DOCK_RADII.save, DOCK_SHADOWS.side)}>
        <SaveStatusIndicator />
        <ColorModeButton />
        <Box width="1px" height="22px" bg={DOCK.divider} />
        <Box
          width="38px"
          height="38px"
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg={DOCK.avatarBg}
          color={DOCK.avatarFg}
        >
          <AvatarGlyph />
        </Box>
      </HStack>

      <AdModal open={adOpen} adId={adId} onClose={() => setAdOpen(false)} />
    </HStack>
  );
}
