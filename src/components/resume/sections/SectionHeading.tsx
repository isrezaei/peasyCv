"use client";

import { memo } from "react";
import { Box, Heading, HStack, VStack } from "@chakra-ui/react";
import type { SectionMeta } from "@/types";
import { getSectionIcon } from "./sectionIcon";

/** Heading treatments ported from the imported templates. */
export type SectionHeadingVariant =
  | "rule" // heading + soft gradient rule (the original column look)
  | "underline" // heading over a full-width hairline rule
  | "solidUnderline" // heading over a full-width 2px accent rule
  | "plain" // small bold heading, no rule
  | "bar" // leading accent bar + heading
  | "chip" // section icon in a soft chip + heading
  | "centered"; // centered heading + short centered rule

interface SectionHeadingProps {
  section: SectionMeta;
  /** Resolved heading colour (resume accent, or a light tint on a dark column). */
  accentColor: string;
  variant?: SectionHeadingVariant;
  /** Light-on-dark column (dark aside) softens the rules to white-alpha. */
  tone?: "onLight" | "onDark";
  /** Chip fill for the `chip` variant (defaults to a faint accent wash). */
  chipColor?: string;
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
  tone = "onLight",
  chipColor,
}: SectionHeadingProps) {
  const ruleColor = tone === "onDark" ? "rgba(255,255,255,0.18)" : "blackAlpha.200";
  const small = variant === "plain";

  const heading = (
    <Heading
      as="h2"
      fontSize={small ? "0.82em" : "1.04em"}
      fontWeight={small ? "800" : "bold"}
      letterSpacing="-0.01em"
      color={accentColor}
      flexShrink={0}
    >
      {section.title}
    </Heading>
  );

  if (variant === "centered") {
    // Centered heading over a FULL-WIDTH rule (full length, edge to edge), with a
    // LIGHTER rule and a TIGHTER heading→rule gap. The overlaid controls never
    // shorten it — see SectionFrame.
    return (
      <VStack dir={section.direction} gap="1" align="stretch" width="full">
        <Box textAlign="center">{heading}</Box>
        <Box width="full" height="1px" borderRadius="full" bg={accentColor} opacity="0.16" />
      </VStack>
    );
  }

  if (variant === "underline" || variant === "solidUnderline") {
    return (
      <Box
        dir={section.direction}
        pb="1.5"
        borderBottomWidth={variant === "solidUnderline" ? "2px" : "1px"}
        borderColor={variant === "solidUnderline" ? accentColor : ruleColor}
      >
        {heading}
      </Box>
    );
  }

  if (variant === "bar") {
    return (
      <HStack dir={section.direction} gap="2" align="center">
        <Box width="4px" height="0.95em" borderRadius="full" bg={accentColor} flexShrink={0} />
        {heading}
      </HStack>
    );
  }

  if (variant === "chip") {
    const ChipIcon = getSectionIcon(section.type);
    return (
      <HStack dir={section.direction} gap="2" align="center">
        <Box
          width="1.7em"
          height="1.7em"
          borderRadius="7px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
          color={accentColor}
          bg={chipColor ?? "rgba(0,0,0,0.05)"}
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
    return <Box dir={section.direction}>{heading}</Box>;
  }

  // "rule" — heading with a soft gradient line filling the remaining width.
  return (
    <Box dir={section.direction}>
      <HStack justify="space-between" align="center" gap="3">
        {heading}
        <Box
          flex="1"
          height="1px"
          opacity="0.18"
          style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
        />
      </HStack>
    </Box>
  );
});
