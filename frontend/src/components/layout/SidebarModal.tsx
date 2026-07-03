"use client";

import { Dialog, Portal, VisuallyHidden } from "@chakra-ui/react";
import { useSidebar } from "@/hooks/store/useSidebar";
import { t } from "@/lib/i18n";
import { SidebarPanels } from "./SidebarPanels";

/**
 * lg-and-below presentation of the contextual sidebar: a Chakra v3 Dialog modal.
 * It shares the exact same `useSidebar` collapse flag as the topbar toggle (which
 * opens it), and renders the identical `SidebarPanels` content. The modal is:
 *  - INSET from every viewport edge — the positioner padding plus `scrollBehavior`
 *    "inside" (which caps the content height) keep it clear of all four edges.
 *  - ROUNDED (the content's `2xl` radius).
 *  - CLOSED BY CLICKING OUTSIDE — `closeOnInteractOutside` (default, set explicitly)
 *    routes the backdrop click back onto the shared flag; Esc stays as a sensible
 *    default. There is intentionally NO on-modal close (X) control.
 * The portal children are `no-print` so the modal never reaches the PDF.
 */
export function SidebarModal() {
  const { collapsed, setCollapsed } = useSidebar();

  return (
    <Dialog.Root
      open={!collapsed}
      onOpenChange={(details) => setCollapsed(!details.open)}
      placement="center"
      scrollBehavior="inside"
      size="xs"
      closeOnInteractOutside={true}
    >
      <Portal>
        <Dialog.Backdrop className="no-print" bg="blackAlpha.500" />
        <Dialog.Positioner className="no-print" padding="4">
          <Dialog.Content bg="white" width="full" maxW="sm" borderRadius="2xl" overflow="hidden">
            <VisuallyHidden>
              <Dialog.Title>{t.sidebar.expand}</Dialog.Title>
            </VisuallyHidden>
            <Dialog.Body p="0" overflowY="auto">
              <SidebarPanels />
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
