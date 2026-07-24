"use client";

import { memo } from "react";
import { Box, Heading, HStack } from "@chakra-ui/react";
import { SectionTitleIcon } from "@/components/resume/sections/SectionTitleIcon";
import type { SectionMeta } from "@/types";

interface SectionTitleBlockProps {
  section: SectionMeta;
  accentColor: string;
  /** Accepted for call-site compatibility; the decorative rule it coloured was
   *  removed with the rest of the section separators. */
  markerColor?: string;
}

/**
 * The section heading (e.g. «تجربه کاری»). Pure presentation: it always paints
 * in the strong resume accent (`accentColor`) — the most prominent text tier.
 * The hover controls (add / delete / settings) live on {@link SectionHoverFrame},
 * which wraps the whole section, so the heading itself carries no chrome. The
 * gradient rule that used to fill the remaining row width was removed at the
 * user's request — sections are separated by spacing and typography only.
 */
export const SectionTitleBlock = memo(function SectionTitleBlock({
  section,
  accentColor,
}: SectionTitleBlockProps) {
  return (
    <Box dir={section.direction}>
      <HStack justify="space-between" align="center" gap="3">
        <HStack gap="1.5" align="center" flexShrink={0} minW="0">
          <SectionTitleIcon type={section.type} />
          <Heading
            as="h2"
            fontSize="1.08em"
            fontWeight="bold"
            letterSpacing="-0.01em"
            // Tight line-box (not the inherited body line-height) so the heading
            // glyph sits close to the content beneath it — the airy 1.5 line-height
            // was what pushed titles visually far from their sections.
            lineHeight="1.15"
            // NO block margin: as a flex item, any vertical margin here enters
            // the icon+title row's centring and shifts the glyphs off the icon's
            // centre line. The row's vertical rhythm is SectionFrame's title pad
            // (SECTION_TITLE_PAD_EM), outside the flex row.
            marginBlock="0"
            color={accentColor}
            flexShrink={0}
          >
            {section.title}
          </Heading>
        </HStack>
      </HStack>
    </Box>
  );
});
