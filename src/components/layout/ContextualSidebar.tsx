"use client";

import { Box, useBreakpointValue, VStack } from "@chakra-ui/react";
import { useSidebar } from "@/hooks/store/useSidebar";
import { RADII, SHADOWS } from "@/lib/design/tokens";
import { SidebarModal } from "./SidebarModal";
import { SidebarPanels } from "./SidebarPanels";

/**
 * The contextual side panel. Its PRESENTATION is responsive:
 *  - lg and below → a Dialog MODAL ({@link SidebarModal}) that overlays the page
 *    with a backdrop, so the narrower canvas is never permanently covered.
 *  - xl and up → the inline overlay panel below: docked to the RTL start (physical
 *    right), always mounted, sliding on `transform`/`opacity` only (GPU-friendly,
 *    no layout reflow) so toggling it never resizes the workspace or shifts the
 *    centred A4 page.
 * Both presentations share the same `SidebarPanels` content and the same
 * `useSidebar` collapse flag, which the topbar toggle drives.
 */
export function ContextualSidebar() {
  const { collapsed } = useSidebar();
  // Client-only (the app renders under <ClientOnly>), so evaluate immediately and
  // fall back to the inline panel until the viewport is measured. Modal for lg and
  // below; the inline panel only appears from xl up (where the canvas also reserves
  // room for it).
  const isModal = useBreakpointValue({ base: true, xl: false }, { ssr: false }) ?? false;

  if (isModal) {
    return <SidebarModal />;
  }

  return (
    <Box
      className="no-print"
      position="absolute"
      top="0"
      bottom="0"
      insetInlineStart="0"
      width="344px"
      p="4"
      zIndex={30}
      pointerEvents={collapsed ? "none" : "auto"}
      aria-hidden={collapsed}
      style={{
        transform: collapsed ? "translateX(calc(100% + 24px))" : "translateX(0)",
        opacity: collapsed ? 0 : 1,
        transition: "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease",
        willChange: "transform",
      }}
    >
      <VStack
        as="aside"
        align="stretch"
        gap="0"
        height="100%"
        width="312px"
        bg="white"
        overflow="hidden"
        style={{ borderRadius: RADII.panel, boxShadow: SHADOWS.panel }}
      >
        <Box flex="1" overflowY="auto">
          <SidebarPanels />
        </Box>
      </VStack>
    </Box>
  );
}
