"use client";

import { memo } from "react";
import { Box, Heading, HStack } from "@chakra-ui/react";
import type { SectionMeta } from "@/types";

interface SectionTitleBlockProps {
  section: SectionMeta;
  accentColor: string;
  showRule?: boolean;
}

/**
 * The section heading (e.g. «تجربه کاری»). Pure presentation: it always paints
 * in the strong resume accent (`accentColor`) — the most prominent text tier.
 * The hover controls (add / delete / settings) live on {@link SectionHoverFrame},
 * which wraps the whole section, so the heading itself carries no chrome.
 */
export const SectionTitleBlock = memo(function SectionTitleBlock({
  section,
  accentColor,
  showRule = false,
}: SectionTitleBlockProps) {
  return (
    <Box dir={section.direction}>
      <HStack justify="space-between" align="center" gap="3">
        <Heading
          as="h2"
          fontSize="1.08em"
          fontWeight="bold"
          letterSpacing="-0.01em"
          // Tight line-box (not the inherited body line-height) so the heading
          // glyph sits close to the content beneath it — the airy 1.5 line-height
          // was what pushed titles visually far from their sections.
          lineHeight="1.15"
          color={accentColor}
          flexShrink={0}
        >
          {section.title}
        </Heading>
        {showRule ? (
          <Box
            flex="1"
            height="1px"
            opacity="0.18"
            style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
          />
        ) : null}
      </HStack>
    </Box>
  );
});
