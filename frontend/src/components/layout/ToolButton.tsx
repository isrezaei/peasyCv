"use client";

import { Box, chakra } from "@chakra-ui/react";
import type { CSSProperties, ReactNode } from "react";
import { Tooltip } from "@/components/ui/Tooltip";
import { DOCK, DOCK_RADII } from "@/lib/design/tokens";

interface ToolButtonProps {
  label: string;
  icon: ReactNode;
  active?: boolean;
  onClick: () => void;
}

// Classic screen-reader-only label: invisible but in the accessibility tree and
// queryable as a text node (the smoke test opens panels via the Persian label).
const srOnly: CSSProperties = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};

/**
 * Icon-only dock tool button (imported "Topbar Dock"): 44x44 with a 13px radius.
 * Idle is a gray glyph on transparent, hover lifts a faint zinc wash, and the
 * active tool becomes a near-black ink pill with a white glyph. The Persian label
 * shows on hover via Tooltip and stays as a visually-hidden text node for screen
 * readers. Colours come from the app's zinc chrome tokens (DOCK), not the design
 * slate.
 */
export function ToolButton({ label, icon, active = false, onClick }: ToolButtonProps) {
  return (
    <Tooltip label={label}>
      <chakra.button
        type="button"
        aria-label={label}
        aria-pressed={active}
        onClick={onClick}
        position="relative"
        display="flex"
        alignItems="center"
        justifyContent="center"
        width="44px"
        height="44px"
        cursor="pointer"
        transition="background .15s, color .15s"
        bg={active ? DOCK.activeBg : "transparent"}
        color={active ? DOCK.activeFg : DOCK.idleFg}
        _hover={active ? undefined : { bg: DOCK.hoverBg, color: DOCK.hoverFg }}
        style={{ borderRadius: DOCK_RADII.tool }}
      >
        {icon}
        <Box as="span" style={srOnly}>
          {label}
        </Box>
      </chakra.button>
    </Tooltip>
  );
}
