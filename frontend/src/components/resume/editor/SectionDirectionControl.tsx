"use client";

import { HStack, SegmentGroup, Text, VStack } from "@chakra-ui/react";
import { DirectionLtrIcon, DirectionRtlIcon } from "@/components/ui/icons";
import { useSectionActions } from "@/hooks/store/useSectionActions";
import { t } from "@/lib/i18n";
import type { Direction, SectionMeta } from "@/types";

interface SectionDirectionControlProps {
  section: SectionMeta;
}

/**
 * The per-section text-direction (RTL/LTR) toggle. Shared so it reads identically
 * inside the section's dots menu ({@link SectionCompactMenu}) and any other
 * settings surface that needs it.
 */
export function SectionDirectionControl({ section }: SectionDirectionControlProps) {
  const { setSectionDirection } = useSectionActions();

  return (
    <VStack align="stretch" gap="2">
      <Text m={0} fontSize="xs"  color="fg.muted">
        {t.sectionPanel.direction}
      </Text>
      <SegmentGroup.Root
        size="xs"
        fontSize={"xs"}
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
  );
}
