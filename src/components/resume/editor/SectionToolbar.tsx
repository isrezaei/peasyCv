"use client";

import { HStack, IconButton } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { Tooltip } from "@/components/ui/Tooltip";

interface ToolbarAction {
  key: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  primary?: boolean;
}

interface SectionToolbarProps {
  actions: ToolbarAction[];
  /** Slot for an inline popover trigger (the per-section gear). */
  settingsSlot?: ReactNode;
}

/**
 * Small floating contextual toolbar shown beside a section while it is hovered
 * or focused. A soft, rounded, low-contrast pill matching the 2026 aesthetic.
 */
export function SectionToolbar({ actions, settingsSlot }: SectionToolbarProps) {
  return (
    <HStack
      className="no-print section-toolbar"
      gap="0.5"
      bg="white"
      borderRadius="lg"
      boxShadow="panel"
      px="1"
      py="1"
    >
      {actions.map((action) => (
        <Tooltip key={action.key} label={action.label}>
          <IconButton
            aria-label={action.label}
            size="xs"
            borderRadius="lg"
            variant={action.primary ? "solid" : "ghost"}
            colorPalette={action.primary ? "accent" : "gray"}
            onClick={action.onClick}
          >
            {action.icon}
          </IconButton>
        </Tooltip>
      ))}
      {settingsSlot}
    </HStack>
  );
}
