"use client";

import { Box, Button, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";

interface ToolButtonProps {
  label: string;
  icon: ReactNode;
  active?: boolean;
  onClick: () => void;
}

/**
 * A horizontal top-bar tab styled with the app's cyan accent: idle is the
 * `cyan` subtle variant, and the active tab lifts to the solid variant so the
 * open panel reads clearly. The label inherits the project font (Kalameh) via
 * the global button font reset in lib/chakra/system.ts.
 */
export function ToolButton({ label, icon, active = false, onClick }: ToolButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      size="xs"
      rounded="lg"
      colorPalette="cyan"
      variant={active ? "solid" : "subtle"}
    >
      <Box display="flex" fontSize="16px">
        {icon}
      </Box>
      <Text fontSize="12px" fontWeight="600" letterSpacing="-0.015em" whiteSpace="nowrap">
        {label}
      </Text>
    </Button>
  );
}
