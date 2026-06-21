"use client";

import { memo } from "react";
import { Box, Heading, HStack } from "@chakra-ui/react";
import { PlusIcon, TrashIcon } from "@/components/ui/icons";
import { useSectionEmptyState } from "@/hooks/store/useSectionEmptyState";
import { useSectionActions } from "@/hooks/store/useSectionActions";
import { t } from "@/lib/i18n";
import type { SectionMeta } from "@/types";
import { SectionSettingsPopover } from "./SectionSettingsPopover";
import { SectionToolbar } from "./SectionToolbar";

interface SectionTitleBlockProps {
  section: SectionMeta;
  accentColor: string;
  showRule?: boolean;
}

export const SectionTitleBlock = memo(function SectionTitleBlock({
  section,
  accentColor,
  showRule = false,
}: SectionTitleBlockProps) {
  const { addEntry } = useSectionEmptyState(section.type);
  const { toggleSectionVisibility } = useSectionActions();

  return (
    <Box className="group" position="relative" dir={section.direction}>
      <HStack justify="space-between" align="center" gap="3">
        <Heading
          as="h2"
          fontSize="1.08em"
          fontWeight="bold"
          letterSpacing="-0.01em"
          color={accentColor}
          flexShrink={0}
        >
          {section.title}
        </Heading>
        {showRule ? <Box flex="1" height="1px" bg={accentColor} opacity="0.18" /> : null}
      </HStack>
      <Box
        position="absolute"
        insetInlineEnd="0"
        top="-12px"
        opacity="0"
        transition="opacity 0.12s"
        _groupHover={{ opacity: 1 }}
        zIndex={5}
      >
        <SectionToolbar
          actions={[
            ...(addEntry
              ? [
                  {
                    key: "add",
                    label: t.sectionToolbar.addEntry,
                    icon: <PlusIcon />,
                    onClick: addEntry,
                    primary: true,
                  },
                ]
              : []),
            {
              key: "delete",
              label: t.sectionToolbar.delete,
              icon: <TrashIcon />,
              onClick: () => toggleSectionVisibility(section.id),
            },
          ]}
          settingsSlot={<SectionSettingsPopover section={section} />}
        />
      </Box>
    </Box>
  );
});
