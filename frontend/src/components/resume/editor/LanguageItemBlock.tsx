"use client";

import { memo } from "react";
import { Box, HStack, IconButton, Text } from "@chakra-ui/react";
import { TrashIcon } from "@/components/ui/icons";
import { useLanguages } from "@/hooks/store/useLanguages";
import { t } from "@/lib/i18n";
import type { Direction, LanguageItem, LanguageMeterVariant } from "@/types";
import { EditableText } from "./EditableText";
import { ITEM_HOVER_OUTLINE, itemRemoveButtonProps } from "./HoverFrame";
import { LanguageLevelMeter } from "./LanguageLevelMeter";

interface LanguageItemBlockProps {
  item: LanguageItem;
  direction: Direction;
  /** Section-wide display settings — every cell of the section obeys the same
   *  three values, controlled from the section's main menu. */
  meterVariant: LanguageMeterVariant;
  showMeter: boolean;
  showLevelText: boolean;
  /** Decorative colour for the meter's FILLED steps/track; unset falls back to
   *  the `--rz-secondary` var (today's classic source). Empty steps stay grey and
   *  the level→fill logic is untouched — only the fill colour source changes. */
  markerColor?: string;
  /**
   * Narrow-column layout (the timeline-panel design's panel): the cell stacks
   * VERTICALLY — the name (with the level word) on top, the COMPACT meter on its
   * own row aligned to the inline-end (visually left in RTL) — instead of the
   * name and a full-size meter sharing one row, which crushes the name to a few
   * characters in a ~38mm column. Unset keeps the shared beside-text cell.
   */
  stacked?: boolean;
}

/**
 * One cell of the Languages grid. The level WORD is always derived from `level`
 * via the i18n table, never stored. Beside-text variants stack the name
 * (subtitle tint) over the word (body tint) with the meter alongside; the
 * "line" variant puts the word inline with the name and stacks a full-width
 * track below — exactly the two geometries the row estimator prices.
 */
export const LanguageItemBlock = memo(function LanguageItemBlock({
  item,
  direction,
  meterVariant,
  showMeter,
  showLevelText,
  markerColor,
  stacked = false,
}: LanguageItemBlockProps) {
  const { updateLanguage, setLanguageLevel, removeLanguage } = useLanguages();

  const nameField = (
    <EditableText
      value={item.name}
      onChange={(value) => updateLanguage(item.id, { name: value })}
      placeholder={t.languages.namePlaceholder}
      // The block only renders for a visible Languages section, so the name is
      // always an enabled field — flag it when empty on a blocked download. The
      // 1–5 level meter always carries a value, so it needs no validation.
      validate
      fontSize="sm"
      fontWeight="medium"
      color="var(--rz-subtitle)"
      // ONE line that end-ellipsizes, like every other entry title. The editor's
      // <input> can't wrap either, and `estimateLanguageRowHeight` prices the cell
      // as a single non-wrapping line — without this the /print span wrapped
      // (`break-word`, so mid-WORD) in a narrow column, painting the cell taller
      // than both the editor and the reserve.
      truncateEnd
    />
  );
  const levelWord = showLevelText ? (
    // Preflight is off, so a bare <p> keeps the UA margin-block — zero it, or
    // the cell outgrows the lines the row estimator counts.
    <Text fontSize="0.8em" color="var(--rz-body)" marginBlock="0">
      {t.languages.levelNames[item.level]}
    </Text>
  ) : null;
  const meter = showMeter ? (
    <LanguageLevelMeter
      level={item.level}
      accentColor={markerColor ?? "var(--rz-secondary)"}
      variant={meterVariant}
      compact={stacked}
      editable
      onChange={(level) => setLanguageLevel(item.id, level)}
    />
  ) : null;

  // Narrow-column composition: name (+ level word) on top, the compact meter on
  // its own row pushed to the inline-end (left in RTL, `justify="flex-end"`), at
  // a tighter cell padding than the full beside-text cell — so the name keeps
  // the whole column width instead of sharing it with the meter.
  if (stacked) {
    return (
      <Box
        className="group"
        position="relative"
        dir={direction}
        p="1.5"
        borderRadius="md"
        _hover={ITEM_HOVER_OUTLINE}
      >
        <HStack justify="space-between" gap="2" align="baseline">
          <Box flex="1" minW="0" display="flex" flexDirection="column">
            {nameField}
          </Box>
          {levelWord}
        </HStack>
        {meter ? (
          <HStack justify="flex-end" mt="1">
            {meter}
          </HStack>
        ) : null}

        <Box className="no-print" display="flex" position="absolute" insetInlineEnd="0" top="0">
          <IconButton
            aria-label={t.languages.removeEntry}
            {...itemRemoveButtonProps}
            onClick={() => removeLanguage(item.id)}
          >
            <TrashIcon />
          </IconButton>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      className="group"
      position="relative"
      dir={direction}
      // Breathing room on all four sides plus a wider inline-end strip (24px =
      // the 2xs control size), so the hover trash at the corner floats in this
      // padding and never overlaps the name/level/meter. The vertical padding
      // is part of the cell's height and is priced by the row estimator
      // (estimateLanguageRowHeight's cell chrome term).
      p="3"
      // pe="6"
      borderRadius="md"
      _hover={ITEM_HOVER_OUTLINE}
    >
      {meterVariant === "line" ? (
        <>
          <HStack justify="space-between" gap="2">
            <Box flex="1" minW="0" display="flex" flexDirection="column">
              {nameField}
            </Box>
            {levelWord}
          </HStack>
          {meter && <Box mt="1">{meter}</Box>}
        </>
      ) : (
        <HStack justify="space-between" gap="2">
          {/* Flex column so the inline input is blockified into an exact
              one-line flex item — anonymous line-box strut/baseline slop would
              otherwise make the cell taller than the lines the estimator counts. */}
          <Box flex="1" minW="0" display="flex" flexDirection="column">
            {nameField}
            {levelWord}
          </Box>
          {meter}
        </HStack>
      )}

      {/* Item chrome overlay — off the layout flow, mirroring the Projects
          overlay: absolute at the inline-end corner, no-print, revealed by this
          cell's own `.group` hover. Display settings live in the section's main
          menu, so the only per-item control is the remove button. */}
      <Box
        className="no-print"
        display="flex"
        position="absolute"
        insetInlineEnd="0"
        top="0"
      >
        <IconButton
          aria-label={t.languages.removeEntry}
          {...itemRemoveButtonProps}
          onClick={() => removeLanguage(item.id)}
        >
          <TrashIcon />
        </IconButton>
      </Box>
    </Box>
  );
});
