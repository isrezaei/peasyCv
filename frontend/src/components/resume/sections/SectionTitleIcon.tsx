"use client";

import { createElement } from "react";
import { Box } from "@chakra-ui/react";
import { useResumeStore } from "@/store/useResumeStore";
import { mixWithWhite, resolveTheme } from "@/lib/themes";
import type { RemovableSectionType } from "@/types";
import { getSectionIcon } from "./sectionIcon";

interface SectionTitleIconProps {
  type: RemovableSectionType;
}

/**
 * The section's own glyph in a rounded-xl chip, shown beside every section heading
 * when the resume-wide «show section icons» toggle is on (off → renders nothing,
 * so the title row is byte-identical to before). Self-contained: it reads the flag
 * and derives its colours straight from the resolved theme, so no template has to
 * thread anything through.
 *
 * Colour comes from the marker seam — `marker ?? accent` — exactly like every other
 * decoration: in vivid that is the raw secondary, in classic the accent (classic's
 * icon source). The chip fill is a soft white-mix of that same colour (0.82), so
 * the background is clearly lighter than the icon yet still shows the hue. Sized in
 * `em` at ~1.6× so it tracks the font-size slider and stays within the heading's
 * over-reserved title-row height (no pagination-estimator change needed — proven
 * by the icons-ON scenario of scripts/measure-pagination.mjs).
 */
export function SectionTitleIcon({ type }: SectionTitleIconProps) {
  const theme = useResumeStore((state) => state.resume.theme);
  if (!theme.showSectionIcons) return null;

  const colors = resolveTheme(theme);
  const iconColor = colors.marker ?? colors.accent;
  // The glyph is a stable module-level react-icons component from a fixed map;
  // rendered via createElement (not a locally-assigned <Icon/>) so the static-
  // components lint rule doesn't mistake the lookup for a per-render component.
  const iconType = getSectionIcon(type);

  return (
    <Box
      as="span"
      flexShrink={0}
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      boxSize="1.6em"
      borderRadius="lg"
      color={iconColor}
      bg={mixWithWhite(iconColor, 0.82)}
    >
      <Box as="span" fontSize="1em" display="inline-flex">
        {createElement(iconType)}
      </Box>
    </Box>
  );
}
