"use client";

import { HStack, SegmentGroup, Text, VStack } from "@chakra-ui/react";
import { SettingsPopover } from "@/components/ui/SettingsPopover";
import { DirectionLtrIcon, DirectionRtlIcon } from "@/components/ui/icons";
import { useSectionActions } from "@/hooks/store/useSectionActions";
import { t } from "@/lib/i18n";
import type { Direction, SectionMeta } from "@/types";

interface SectionSettingsPopoverProps {
  section: SectionMeta;
}

/**
 * Per-section gear. Every section gets one, and the section's text-direction
 * (RTL/LTR) control lives here — moved out of the arrangement panel so it sits
 * next to the content it affects.
 */
export function SectionSettingsPopover({ section }: SectionSettingsPopoverProps) {
  const { setSectionDirection } = useSectionActions();

  return (
    <SettingsPopover title={section.title} triggerLabel={t.sectionToolbar.settings}>
      <VStack align="stretch" gap="2">
        <Text fontSize="xs" fontWeight="medium" color="fg.muted">
          {t.sectionPanel.direction}
        </Text>
        <SegmentGroup.Root
          size="sm"
          width="100%"
          value={section.direction}
          onValueChange={(details) => {
            if (details.value) setSectionDirection(section.id, details.value as Direction);
          }}
        >
          <SegmentGroup.Indicator />
          <SegmentGroup.Items
            flex="1"
            items={[
              {
                value: "rtl",
                label: (
                  <HStack gap="1.5" justify="center">
                    <DirectionRtlIcon />
                    <span>{t.sectionPanel.rtl}</span>
                  </HStack>
                ),
              },
              {
                value: "ltr",
                label: (
                  <HStack gap="1.5" justify="center">
                    <DirectionLtrIcon />
                    <span>{t.sectionPanel.ltr}</span>
                  </HStack>
                ),
              },
            ]}
          />
        </SegmentGroup.Root>
      </VStack>
    </SettingsPopover>
  );
}
