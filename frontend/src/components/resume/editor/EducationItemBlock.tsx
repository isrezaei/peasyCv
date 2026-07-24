"use client";

import { memo } from "react";
import { Box, HStack, Icon, IconButton, Stack, VStack } from "@chakra-ui/react";
import { TrashIcon } from "@/components/ui/icons";
import { useAtsMode } from "@/hooks/store/useAtsMode";
import { useEducation } from "@/hooks/store/useEducation";
import { periodDateFormat } from "@/lib/dates/format";
import { t } from "@/lib/i18n";
import { periodDateColumnMm } from "@/lib/pagination";
import type { Direction, EducationItem, MonthFormat } from "@/types";
import { DateField } from "./DateField";
import { EditableText } from "./EditableText";
import { ITEM_HOVER_OUTLINE, itemRemoveButtonProps } from "./HoverFrame";
import { SecondaryTitleField } from "./SecondaryTitleField";
import { TimelineRail } from "./TimelineRail";
import { TbCurrentLocationFilled } from "react-icons/tb";

interface EducationItemBlockProps {
  item: EducationItem;
  direction: Direction;
  accentColor: string;
  /** Decorative colour for the timeline rail; unset falls back to the accent. */
  markerColor?: string;
  /** Section-wide period-date display settings (see SectionMeta.showMonth). */
  showMonth?: boolean;
  monthFormat?: MonthFormat;
  /**
   * Narrow-column layout: the period renders as ONE date-range row ABOVE the
   * degree instead of in the fixed {@link periodDateColumnMm} column beside it —
   * the composition the timeline-panel design uses for its side panel, and the
   * only one that fits there at all (a 25mm date column leaves ~10mm of text in a
   * 30% panel, which wraps a single entry to several hundred px). Unset keeps the
   * shared date-column entry every other template paints.
   */
  stacked?: boolean;
}

/**
 * Education entry. Deliberately mirrors ExperienceItemBlock — same date column,
 * shared timeline rail, identical spacing/typography and remove control — so the
 * two sections read as one consistent family.
 */
export const EducationItemBlock = memo(function EducationItemBlock({
  item,
  direction,
  accentColor,
  markerColor,
  showMonth = true,
  monthFormat = "name",
  stacked = false,
}: EducationItemBlockProps) {
  const { updateEducation, removeEducation } = useEducation();
  // ATS Friendly mode drops the inline location glyph but keeps the city text.
  const ats = useAtsMode();
  // Derived display only — the store keeps the full ISO date either way.
  const dateFormat = periodDateFormat(showMonth, monthFormat);
  // The SAME width the pagination estimator reserves (matching Experience).
  const dateColumnWidth = `${periodDateColumnMm(showMonth, monthFormat)}mm`;
  // Every rendered field of a visible section validates (see ExperienceItemBlock).
  const validate = true;

  const startDate = (
    <DateField
      monthYear
      format={dateFormat}
      value={item.startDate}
      onChange={(value) => updateEducation(item.id, { startDate: value })}
      placeholder={t.education.startDate}
      validate={validate}
      color="var(--rz-secondary, #3f3f46)"
      fontSize={"xs"}
      fontWeight={"bold"}
    />
  );
  const endDate = (
    <DateField
      monthYear
      format={dateFormat}
      value={item.endDate}
      onChange={(value) => updateEducation(item.id, { endDate: value })}
      placeholder={t.education.endDate}
      validate={validate}
      color="var(--rz-secondary, #3f3f46)"
      fontSize={"xs"}
      fontWeight={"bold"}
    />
  );
  const city = (
    <HStack gapX={1} minW="0">
      {ats ? null : <Icon as={TbCurrentLocationFilled} color="fg.muted" boxSize={3} />}
      <EditableText
        value={item.city}
        onChange={(value) => updateEducation(item.id, { city: value })}
        placeholder={t.education.cityPlaceholder}
        validate={validate}
        fontSize="2xs"
        color="fg.muted"
      />
    </HStack>
  );
  const body = (
    <>
      <EditableText
        value={item.degree}
        onChange={(value) => updateEducation(item.id, { degree: value })}
        placeholder={t.education.degreePlaceholder}
        validate={validate}
        fontWeight="600"
        fontSize="sm"
        color="var(--rz-secondary, #3f3f46)"
      />
      <SecondaryTitleField
        value={item.university}
        onChange={(value) => updateEducation(item.id, { university: value })}
        placeholder={t.education.universityPlaceholder}
        accentColor={accentColor}
        validate={validate}
      />
      <EditableText
        value={item.gpa}
        onChange={(value) => updateEducation(item.id, { gpa: value })}
        placeholder={t.education.gpaPlaceholder}
        validate={validate}
        fontSize="xs"
        color="fg.muted"
      />
      <EditableText
        value={item.achievements}
        onChange={(value) => updateEducation(item.id, { achievements: value })}
        placeholder={t.education.achievementsPlaceholder}
        validate={validate}
        multiline
        fontSize="xs"
        color="var(--rz-body, #3f3f46)"
      />
    </>
  );

  if (stacked) {
    // Narrow-column composition (the timeline-panel design's panel): «start –
    // end» on one muted row, then degree / university / GPA / achievements at
    // the reference's pinned type — 11px period (body tier), 12px/700 degree
    // (primary tier), 11.5px school (subtitle tier, not bold). No date column
    // and no rail, so the full column width carries the text. The sizes mirror
    // the `STACKED_EDU_*` paint↔reserve constants.
    return (
      <HStack
        className="group"
        align="flex-start"
        justify="space-between"
        position="relative"
        dir={direction}
        pb="1.5"
        borderRadius="md"
        _hover={ITEM_HOVER_OUTLINE}
      >
        <VStack align="stretch" flex="1" minW="0" gap="0.5" dir={direction}>
          <HStack gap="1" align="baseline" flexWrap="wrap" minW="0">
            <Box flexShrink={0}>
              <DateField
                monthYear
                format={dateFormat}
                value={item.startDate}
                onChange={(value) => updateEducation(item.id, { startDate: value })}
                placeholder={t.education.startDate}
                validate={validate}
                color="var(--rz-body, #52525b)"
                fontSize="0.7333em"
                fontWeight="normal"
              />
            </Box>
            {/* The separator renders only when BOTH dates are set, so the print
                surface — where an unset date emits nothing — can never show an
                orphaned dash. */}
            {item.startDate && item.endDate ? (
              <Box as="span" fontSize="0.7333em" color="var(--rz-body, #52525b)" flexShrink={0}>
                –
              </Box>
            ) : null}
            <Box flexShrink={0}>
              <DateField
                monthYear
                format={dateFormat}
                value={item.endDate}
                onChange={(value) => updateEducation(item.id, { endDate: value })}
                placeholder={t.education.endDate}
                validate={validate}
                color="var(--rz-body, #52525b)"
                fontSize="0.7333em"
                fontWeight="normal"
              />
            </Box>
            {city}
          </HStack>
          <EditableText
            value={item.degree}
            onChange={(value) => updateEducation(item.id, { degree: value })}
            placeholder={t.education.degreePlaceholder}
            validate={validate}
            fontWeight="700"
            fontSize="0.8em"
            color="var(--rz-secondary, #3f3f46)"
            // Long degrees WRAP on print (the estimator prices the wrapped
            // lines); the editor input end-ellipsizes instead of hard-clipping.
            inputEllipsis
          />
          <SecondaryTitleField
            value={item.university}
            onChange={(value) => updateEducation(item.id, { university: value })}
            placeholder={t.education.universityPlaceholder}
            accentColor={accentColor}
            fontSize="0.7667em"
            fontWeight="normal"
            validate={validate}
            truncateEnd={false}
          />
          <EditableText
            value={item.gpa}
            onChange={(value) => updateEducation(item.id, { gpa: value })}
            placeholder={t.education.gpaPlaceholder}
            validate={validate}
            fontSize="xs"
            color="fg.muted"
          />
          <EditableText
            value={item.achievements}
            onChange={(value) => updateEducation(item.id, { achievements: value })}
            placeholder={t.education.achievementsPlaceholder}
            validate={validate}
            multiline
            fontSize="xs"
            color="var(--rz-body, #3f3f46)"
          />
        </VStack>

        <IconButton
          aria-label={t.education.removeEntry}
          {...itemRemoveButtonProps}
          onClick={() => removeEducation(item.id)}
        >
          <TrashIcon />
        </IconButton>
      </HStack>
    );
  }

  return (
    <HStack
      className="group"
      align="flex-start"
      justify="space-between"
      position="relative"
      dir={direction}
      pb="1.5"
      borderRadius="md"
      _hover={ITEM_HOVER_OUTLINE}
    >
      <HStack w="full" align="flex-start" gap="3" dir="rtl">
        {/* Date / location column (always on the left, matching Experience).
            Width follows the date text's length class, like Experience. */}
        <Stack width={dateColumnWidth} dir={direction} gap={1}>
          {startDate}
          {endDate}
          {city}
        </Stack>

        {/* Timeline rail */}
        <TimelineRail accentColor={markerColor ?? accentColor} />

        {/* Main column */}
        <VStack align="stretch" flex="1" minW="0" gap="0.5" dir={direction}>
          {body}
        </VStack>
      </HStack>

      <IconButton
        aria-label={t.education.removeEntry}
        {...itemRemoveButtonProps}
        onClick={() => removeEducation(item.id)}
      >
        <TrashIcon />
      </IconButton>
    </HStack>
  );
});
