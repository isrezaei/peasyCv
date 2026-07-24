"use client";

import { Box } from "@chakra-ui/react";
import {
  SECTION_SEPARATOR_EXTRA_PX,
  SECTION_SEPARATOR_GAP_ABOVE_PX,
  SECTION_SEPARATOR_GAP_BELOW_PX,
  SECTION_SEPARATOR_LINE_PX,
  SECTION_TITLE_CONTENT_GAP_PX,
  SECTION_TITLE_PAD_EM,
} from "@/lib/pagination";
import { ON_DARK_SURFACE_TEXT } from "@/lib/themes";
import { useResumeStore } from "@/store/useResumeStore";

/** Neutral hairline on light surfaces — a plain grey (NOT theme/marker/accent),
 *  matching Chakra's blackAlpha.300, so the line reads on white and on every
 *  soft page tint without taking the palette's hue. */
const NEUTRAL_LINE_ON_LIGHT = "rgba(0, 0, 0, 0.16)";

interface SectionSeparatorProps {
  /** Light vs dark surface — dark columns/bands get a light line, light ones a darker line. */
  tone?: "onLight" | "onDark";
}

/**
 * The optional hairline under every section title, shown when the resume-wide
 * «section separators» toggle is on (off → renders nothing, so the title row is
 * byte-identical to before). Self-contained like {@link SectionTitleIcon}: it
 * reads the flags straight from the store, so no template has to thread anything
 * through.
 *
 * Colour is NEUTRAL by design — grey on light surfaces, the shared white-alpha
 * hairline token on dark ones — adapting to the surface for visibility but never
 * taking the theme's hue.
 *
 * Rendered by {@link SectionFrame} as an absolutely-positioned OVERLAY centred
 * in the frame's EXISTING title→content corridor (the
 * {@link SECTION_TITLE_PAD_EM} bottom pad + the frame's
 * {@link SECTION_TITLE_CONTENT_GAP_PX} content gap ≈ 15.5px — the approved E-12
 * spacing). The line is drawn WITHIN that gap, so turning the separator on adds
 * ZERO in-flow height: the content sits in exactly the same place on the page
 * as with the separator off, and `estimateSectionTitleHeight` reserves the same
 * height in both states. The 10/1/10 constants describe the separator's own
 * clearance box (its padded height, {@link SECTION_SEPARATOR_EXTRA_PX}), which
 * this overlay centres on the corridor's midpoint — landing the line ~10px of
 * ink air from the title above and the content below.
 */
export function SectionSeparator({ tone = "onLight" }: SectionSeparatorProps) {
  const show = useResumeStore((state) => state.resume.theme.showSectionSeparators);
  // ATS Friendly mode is text-only: no decorative rules, whatever the toggle.
  const ats = useResumeStore((state) => state.resume.theme.atsMode);
  if (!show || ats) return null;

  return (
    <Box
      aria-hidden
      position="absolute"
      insetInline="0"
      // Centre this box (its padded height is SECTION_SEPARATOR_EXTRA_PX) on the
      // corridor's midpoint. The corridor spans the frame's bottom title pad
      // (SECTION_TITLE_PAD_EM em, from this box's containing block's bottom
      // edge upward) plus the content Box's 2px mt below it, so, measured from
      // the containing block's bottom edge:
      //   bottom = pad/2 − gap/2 − box/2  →  calc(0.45em − 11.5px) at defaults.
      bottom={`calc(${SECTION_TITLE_PAD_EM / 2}em - ${
        (SECTION_TITLE_CONTENT_GAP_PX + SECTION_SEPARATOR_EXTRA_PX) / 2
      }px)`}
      pt={`${SECTION_SEPARATOR_GAP_ABOVE_PX}px`}
      pb={`${SECTION_SEPARATOR_GAP_BELOW_PX}px`}
    >
      <Box
        data-testid="section-separator"
        height={`${SECTION_SEPARATOR_LINE_PX}px`}
        bg={tone === "onDark" ? ON_DARK_SURFACE_TEXT.separator : NEUTRAL_LINE_ON_LIGHT}
      />
    </Box>
  );
}
