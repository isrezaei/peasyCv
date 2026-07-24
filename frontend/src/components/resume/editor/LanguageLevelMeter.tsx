"use client";

import { Box, chakra, HStack } from "@chakra-ui/react";
import {
  LANGUAGE_BAR_HEIGHT_COMPACT_PX,
  LANGUAGE_BAR_HEIGHT_PX,
  LANGUAGE_LINE_TRACK_PX,
  LANGUAGE_METER_BOX_COMPACT_PX,
  LANGUAGE_METER_BOX_PX,
} from "@/lib/pagination";
import type { LanguageLevel, LanguageMeterVariant } from "@/types";

interface LanguageLevelMeterProps {
  level: LanguageLevel;
  accentColor: string;
  variant: LanguageMeterVariant;
  editable?: boolean;
  onChange?: (level: LanguageLevel) => void;
  /**
   * COMPACT sizing for a narrow column (the timeline-panel design's panel): the
   * dot/pill box and the bar height drop to their compact constants so the meter
   * fits its own row without crowding the language name. The "line" variant is
   * already a full-width track, so it ignores this. The level→fill logic and the
   * paint↔reserve constants are otherwise unchanged.
   */
  compact?: boolean;
}

/**
 * THE single level→fill source shared by every variant: discrete shapes fill
 * `step <= level` of these steps, continuous tracks fill `level / STEPS.length`
 * of their length. Variants differ ONLY in the shape that paints the result.
 */
const STEPS: LanguageLevel[] = [1, 2, 3, 4, 5];
const fillFraction = (level: LanguageLevel) => level / STEPS.length;

/** Beside-text track width, derived from the shared compact meter box. Exported
 *  so a list owner can pin the full-width "line" variant to the same compact
 *  track length when the meter sits beside text instead of stacked below it. */
export const PILL_TRACK_PX = STEPS.length * LANGUAGE_METER_BOX_PX;

/**
 * The Languages level meter. Vertical geometry comes from the SAME pagination
 * constants the language-row estimator measures with, so the painted meter can
 * never grow past the height the packer reserved for it: the bars variant is
 * exactly the (taller) bar height, dots/pill live inside the compact meter
 * box, and the stacked "line" variant is exactly the fixed track thickness.
 */
export function LanguageLevelMeter({
  level,
  accentColor,
  variant,
  editable = false,
  onChange,
  compact = false,
}: LanguageLevelMeterProps) {
  // The compact column meter shrinks the discrete box and the bar height to
  // their compact constants; the "line" track is full-width and stays put.
  const boxPx = compact ? LANGUAGE_METER_BOX_COMPACT_PX : LANGUAGE_METER_BOX_PX;
  const barPx = compact ? LANGUAGE_BAR_HEIGHT_COMPACT_PX : LANGUAGE_BAR_HEIGHT_PX;
  if (variant === "pill" || variant === "line") {
    const isLine = variant === "line";
    return (
      <Box
        position="relative"
        width={isLine ? "100%" : `${STEPS.length * boxPx}px`}
        height={isLine ? `${LANGUAGE_LINE_TRACK_PX}px` : `${boxPx}px`}
        borderRadius="full"
        bg="gray.200"
        overflow="hidden"
      >
        <Box
          position="absolute"
          insetInlineStart="0"
          top="0"
          height="100%"
          width={`${fillFraction(level) * 100}%`}
          borderRadius="full"
          bg={accentColor}
        />
        {editable && (
          <HStack position="absolute" inset="0" gap="0">
            {STEPS.map((step) => (
              // Preflight is off, so a bare <button> keeps the UA's OPAQUE
              // ButtonFace background — without an explicit transparent bg these
              // invisible hit zones would tile over the track and hide the fill.
              <chakra.button
                key={step}
                type="button"
                flex="1"
                height="100%"
                bg="transparent"
                cursor="pointer"
                aria-label={`سطح ${step}`}
                onClick={onChange ? () => onChange(step) : undefined}
              />
            ))}
          </HStack>
        )}
      </Box>
    );
  }

  return (
    <HStack gap="1">
      {STEPS.map((step) => {
        const filled = step <= level;
        const stepStyle =
          variant === "dots"
            ? {
                width: `${boxPx}px`,
                height: `${boxPx}px`,
                borderRadius: "full",
                bg: filled ? accentColor : "gray.200",
              }
            : {
                width: compact ? "2.5px" : "3px",
                height: `${barPx}px`,
                borderRadius: "full",
                bg: filled ? accentColor : "gray.200",
              };
        return editable ? (
          <chakra.button
            key={step}
            type="button"
            {...stepStyle}
            cursor="pointer"
            aria-label={`سطح ${step}`}
            onClick={onChange ? () => onChange(step) : undefined}
          />
        ) : (
          <Box key={step} {...stepStyle} />
        );
      })}
    </HStack>
  );
}
