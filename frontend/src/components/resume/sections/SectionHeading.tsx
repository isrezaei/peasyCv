"use client";

import { memo } from "react";
import { Box, Heading, HStack, VStack } from "@chakra-ui/react";
import type { SectionMeta } from "@/types";
import { getSectionIcon } from "./sectionIcon";
import { SectionTitleIcon } from "./SectionTitleIcon";

/**
 * Heading treatments ported from the imported templates. Every rule/underline
 * these variants used to draw was removed at the user's request — sections are
 * separated by spacing and typography only — so the variants now differ solely
 * in alignment, size and the chip icon. The ids are kept so call sites (and
 * persisted template choices) stay valid.
 */
export type SectionHeadingVariant =
  | "rule" // heading only (the soft gradient rule was removed)
  | "underline" // heading only (the hairline rule was removed)
  | "solidUnderline" // heading only (the 2px accent rule was removed)
  | "plain" // small bold heading, no rule
  | "bar" // heading only (the leading accent bar was removed earlier)
  | "chip" // section icon in a soft chip + heading
  | "centered"; // centered heading (the centered rule was removed)

interface SectionHeadingProps {
  section: SectionMeta;
  /** Resolved heading colour (resume accent, or a light tint on a dark column). */
  accentColor: string;
  variant?: SectionHeadingVariant;
  /** Accepted for call-site compatibility; it only tinted the (removed) rules. */
  tone?: "onLight" | "onDark";
  /** Chip fill for the `chip` variant (defaults to a faint accent wash). */
  chipColor?: string;
  /** Decorative colour for the rules/bar/underline/chip fill; unset falls back
   *  to the accent (or chipColor for the chip), keeping classic unchanged. */
  markerColor?: string;
  /** `chip` variant: the icon-square size (default `1.7em`) and corner radius
   *  (default `7px`). A template pins these to a design's exact icon chip. */
  chipSize?: string;
  chipRadius?: string;
  /** `chip` variant: an explicit icon-square FILL that takes precedence over the
   *  marker/chipColor fallback — a template uses it to keep the square a light,
   *  header-harmonised wash even under a vivid palette (whose marker is saturated).
   *  Unset preserves the classic `markerColor ?? chipColor` fill. */
  chipBg?: string;
  /**
   * Heading typography overrides, so a template can pin a design's exact heading
   * scale (the timeline-panel reference's 19px main / 14px panel headings) instead
   * of the shared 1.04em. A template that sets `fontSize` MUST also declare the
   * same em on its layout descriptor's `sectionTitleEm`, or the pagination reserve
   * would price a different row than the page paints. Unset keeps the shared scale.
   */
  fontSize?: string;
  fontWeight?: string;
  letterSpacing?: string;
}

/**
 * The section heading (e.g. «تجربه کاری»). Pure presentation, display-only — the
 * section title itself is edited from the section settings popover, exactly like
 * {@link SectionTitleBlock}. This sibling adds the heading *treatments* the
 * imported designs use, while the hover controls still live on the surrounding
 * {@link SectionHoverFrame}.
 */
export const SectionHeading = memo(function SectionHeading({
  section,
  accentColor,
  variant = "rule",
  chipColor,
  markerColor,
  chipSize = "1.7em",
  chipRadius = "7px",
  chipBg,
  fontSize,
  fontWeight,
  letterSpacing,
}: SectionHeadingProps) {
  const small = variant === "plain";

  const heading = (
    <Heading
      as="h2"
      fontSize={fontSize ?? (small ? "0.82em" : "1.04em")}
      fontWeight={fontWeight ?? (small ? "800" : "bold")}
      letterSpacing={letterSpacing ?? "-0.01em"}
      // Tight line-box so the heading hugs its content (see SectionTitleBlock).
      lineHeight="1.15"
      // NO block margin — flex-item margins would shift the glyphs off the icon
      // chip's centre line; the rhythm is SectionFrame's title pad instead.
      marginBlock="0"
      color={accentColor}
      flexShrink={0}
    >
      {section.title}
    </Heading>
  );

  // Heading with the optional resume-wide section-icon chip prefixed. Used by every
  // treatment except `chip` (which renders its own always-on icon). The chip is null
  // when the toggle is off, so this is identical to the bare heading in that case.
  const titleNode = (
    <HStack gap="1.5" align="center" flexShrink={0} minW="0">
      <SectionTitleIcon type={section.type} />
      {heading}
    </HStack>
  );

  if (variant === "centered") {
    // Centered heading; its former full-width rule was removed with the rest of
    // the section separators — spacing alone separates the sections now.
    return (
      <VStack dir={section.direction} gap="0.5" align="stretch" width="full">
        <HStack justify="center" gap="1.5" align="center">
          <SectionTitleIcon type={section.type} />
          {heading}
        </HStack>
      </VStack>
    );
  }

  if (variant === "underline" || variant === "solidUnderline") {
    // The hairline / 2px accent underline was removed with the rest of the
    // section separators; the heading keeps its bottom padding so the section's
    // vertical rhythm (and its pagination estimate) is unchanged. The pad is the
    // SAME whether the opt-in separator overlay is on or off — the overlay adds
    // no flow height, so the title area must not change height either.
    return (
      <Box dir={section.direction} pb="1">
        {titleNode}
      </Box>
    );
  }

  if (variant === "bar") {
    // The leading accent bar was purely decorative — an inline sibling of the
    // heading, vertically centred at height 0.95em (< the heading's own line
    // box), so it never contributed to the section's height. Removed at the
    // user's request; the timeline heading is now just its title text.
    return (
      <HStack dir={section.direction} gap="2" align="center">
        {titleNode}
      </HStack>
    );
  }

  if (variant === "chip") {
    const ChipIcon = getSectionIcon(section.type);
    return (
      <HStack dir={section.direction} gap="2" align="center">
        <Box
          width={chipSize}
          height={chipSize}
          borderRadius={chipRadius}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
          color={accentColor}
          bg={chipBg ?? markerColor ?? chipColor ?? "rgba(0,0,0,0.05)"}
        >
          <Box as="span" fontSize="0.95em" display="inline-flex">
            <ChipIcon />
          </Box>
        </Box>
        {heading}
      </HStack>
    );
  }

  if (variant === "plain") {
    return <Box dir={section.direction}>{titleNode}</Box>;
  }

  // "rule" — heading only; its soft gradient line was removed with the rest of
  // the section separators.
  return (
    <Box dir={section.direction}>
      <HStack justify="space-between" align="center" gap="3">
        {titleNode}
      </HStack>
    </Box>
  );
});
