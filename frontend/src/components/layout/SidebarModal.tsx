"use client";

import { Drawer, IconButton, Portal, SegmentGroup, VisuallyHidden } from "@chakra-ui/react";
import { CloseIcon } from "@/components/ui/icons";
import { useActivePanel } from "@/hooks/store/useActivePanel";
import { useSidebar } from "@/hooks/store/useSidebar";
import { t } from "@/lib/i18n";
import type { ActivePanel } from "@/store/types";
import { SidebarPanels } from "./SidebarPanels";

/**
 * Phone/tablet presentation of the contextual sidebar (below Chakra `xl`): a
 * FULL-HEIGHT overlay drawer that starts CLOSED and slides over the canvas
 * without squeezing it. It shares the exact `useSidebar` collapse flag the top
 * bar drives, and renders the identical `SidebarPanels` content the desktop
 * inline panel uses.
 *
 * Unlike the desktop dock (which switches panels from the top bar), the drawer
 * carries its OWN panel switcher — a segmented control in the header — so a touch
 * user can move between Design / Templates / Sections without closing the sheet,
 * plus an explicit close (×) for a clear finger target. Portal children are
 * `no-print` so the drawer never reaches the PDF.
 */
export function SidebarModal() {
  const { collapsed, setCollapsed } = useSidebar();
  const { activePanel, setActivePanel } = useActivePanel();

  const panelItems: { value: ActivePanel; label: string }[] = [
    { value: "design", label: t.topbar.design },
    { value: "templates", label: t.topbar.templates },
    { value: "rearrange", label: t.topbar.rearrange },
  ];

  return (
    <Drawer.Root
      open={!collapsed}
      onOpenChange={(details) => setCollapsed(!details.open)}
      placement="start"
    >
      <Portal>
        <Drawer.Backdrop className="no-print" bg="blackAlpha.500" />
        <Drawer.Positioner className="no-print">
          <Drawer.Content
            bg="bg.panel"
            height="100dvh"
            width={{ base: "92vw", sm: "380px" }}
            maxWidth="420px"
            display="flex"
            flexDirection="column"
          >
            <VisuallyHidden>
              <Drawer.Title>{t.sidebar.expand}</Drawer.Title>
            </VisuallyHidden>
            {/* Header: panel switcher + close. Stays fixed while the body scrolls. */}
            <Drawer.Header
              display="flex"
              alignItems="center"
              gap="10px"
              px="14px"
              py="12px"
              borderBottomWidth="1px"
              borderColor="border"
              flexShrink={0}
            >
              <SegmentGroup.Root
                size="sm"
                flex="1"
                value={activePanel}
                onValueChange={(details) => details.value && setActivePanel(details.value as ActivePanel)}
              >
                <SegmentGroup.Indicator />
                <SegmentGroup.Items flex="1" items={panelItems} />
              </SegmentGroup.Root>
              <Drawer.CloseTrigger asChild>
                <IconButton aria-label={t.sidebar.collapse} variant="ghost" size="sm" flexShrink={0}>
                  <CloseIcon />
                </IconButton>
              </Drawer.CloseTrigger>
            </Drawer.Header>
            <Drawer.Body p="0" overflowY="auto" flex="1">
              <SidebarPanels />
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
