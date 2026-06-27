"use client";

import { Box, Button, Separator, VStack } from "@chakra-ui/react";
import { SettingsPopover } from "@/components/ui/SettingsPopover";
import { DotsIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { useSectionActions } from "@/hooks/store/useSectionActions";
import { useSectionEmptyState } from "@/hooks/store/useSectionEmptyState";
import { t } from "@/lib/i18n";
import type { SectionMeta } from "@/types";
import { SectionDirectionControl } from "./SectionDirectionControl";

interface SectionCompactMenuProps {
  section: SectionMeta;
  /** Light vs dark surrounding column — adapts the solid dots chip. */
  tone?: "onLight" | "onDark";
}

// Clean, full-width menu row: leading icon, left-aligned label, soft hover.
const menuItemProps = {
  size: "sm",
  variant: "ghost",
  colorPalette: "gray",
  width: "100%",
  justifyContent: "flex-start",
  gap: "2.5",
  borderRadius: "lg",
  fontWeight: "500",
  color: "fg.muted",
  _hover: { bg: "bg.muted", color: "fg" },
} as const;

/**
 * Every section's HoverFrame: ONE bare 3-dots glyph in the resume accent (kept off
 * the layout flow by {@link SectionFrame}, so it never displaces the heading or its
 * rule) that opens a clean menu with the section's tools — add entry, delete, and
 * the text-direction control.
 */
export function SectionCompactMenu({ section, tone = "onLight" }: SectionCompactMenuProps) {
  const { addEntry } = useSectionEmptyState(section.type);
  const { toggleSectionVisibility } = useSectionActions();

  return (
    <SettingsPopover
      title={section.title}
      triggerLabel={t.sectionToolbar.settings}
      triggerSize="2xs"
      icon={<DotsIcon />}
      triggerRest={0.55}
      tone={tone}
    >
      <VStack align="stretch" gap="0.5">
        {addEntry ? (
          <Button {...menuItemProps} onClick={addEntry}>
            <Box display="inline-flex" fontSize="md">
              <PlusIcon />
            </Box>
            {t.sectionToolbar.addEntry}
          </Button>
        ) : null}
        <Button {...menuItemProps} onClick={() => toggleSectionVisibility(section.id)}>
          <Box display="inline-flex" fontSize="md">
            <TrashIcon />
          </Box>
          {t.sectionToolbar.delete}
        </Button>
        <Separator borderColor="border" my="1.5" />
        <Box px="1">
          <SectionDirectionControl section={section} />
        </Box>
      </VStack>
    </SettingsPopover>
  );
}
