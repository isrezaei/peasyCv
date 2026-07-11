"use client";

import { chakra } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/Tooltip";
import { useSidebar } from "@/hooks/store/useSidebar";
import { DOCK, DOCK_RADII, DOCK_SHADOWS } from "@/lib/design/tokens";
import { t } from "@/lib/i18n";
import { PanelToggleGlyph } from "./dockIcons";

/**
 * The side-panel open/close toggle, living in the topbar (RTL start / far right)
 * as the imported "Topbar Dock" specifies. A standalone glass button; the glyph
 * flips horizontally to signal the panel's current state. Drives the same
 * `useSidebar` collapse flag the panel reads.
 */
export function DockToggleButton() {
  const { collapsed, setCollapsed } = useSidebar();
  const open = !collapsed;
  const label = open ? t.sidebar.collapse : t.sidebar.expand;

  return (
    <Tooltip label={label}>
      <chakra.button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setCollapsed(open)}
        flex="none"
        display="flex"
        alignItems="center"
        justifyContent="center"
        width="44px"
        height="44px"
        cursor="pointer"
        color={DOCK.idleFg}
        bg={DOCK.glassBg}
        transition="background .15s, color .15s"
        _hover={{ bg: DOCK.glassSolid, color: DOCK.hoverFg }}
        style={{
          borderRadius: DOCK_RADII.toggle,
          border: `1px solid ${DOCK.borderStrong}`,
          backdropFilter: DOCK.blur,
          WebkitBackdropFilter: DOCK.blur,
          boxShadow: DOCK_SHADOWS.side,
        }}
      >
        <PanelToggleGlyph
          style={{
            transform: open ? "scaleX(1)" : "scaleX(-1)",
            transition: "transform .25s ease",
          }}
        />
      </chakra.button>
    </Tooltip>
  );
}
