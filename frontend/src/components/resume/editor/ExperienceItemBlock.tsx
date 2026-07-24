"use client";

import { memo } from "react";
import { Box, chakra, HStack, Icon, IconButton, Link, Stack, VStack } from "@chakra-ui/react";
import { LinkIcon, TrashIcon } from "@/components/ui/icons";
import { useAtsMode } from "@/hooks/store/useAtsMode";
import { useExperience } from "@/hooks/store/useExperience";
import { useResumeStore } from "@/store/useResumeStore";
import { periodDateFormat } from "@/lib/dates/format";
import { t } from "@/lib/i18n";
import { periodDateColumnMm } from "@/lib/pagination";
import { shouldRenderProjectLink } from "@/lib/resume/projectLink";
import { sanitizeProjectUrl } from "@/lib/resume/sanitizeUrl";
import type { Direction, ExperienceItem, MonthFormat } from "@/types";
import { DateField } from "./DateField";
import { EditableText, SIZE_EM } from "./EditableText";
import { ITEM_HOVER_OUTLINE, itemRemoveButtonProps } from "./HoverFrame";
import { ResponsibilityListEditor } from "./ResponsibilityListEditor";
import { SecondaryTitleField } from "./SecondaryTitleField";
import { SectionOptionsGear } from "./SectionOptionsGear";
import { TimelineRail } from "./TimelineRail";
import { TbCurrentLocationFilled } from "react-icons/tb";

interface ExperienceItemBlockProps {
  item: ExperienceItem;
  direction: Direction;
  accentColor: string;
  /** Decorative colour for the timeline rail + bullets; unset falls back to the accent. */
  markerColor?: string;
  /** Section-wide period-date display settings (see SectionMeta.showMonth). */
  showMonth?: boolean;
  monthFormat?: MonthFormat;
  /**
   * Pagination: render only this half-open `[start, end)` slice of the
   * responsibilities list. Set by the packer when an over-page entry is split
   * between bullet rows; unset renders the whole list.
   */
  respRange?: { start: number; end: number };
  /**
   * Pagination: true on the 2nd+ page of a split entry. The head rows (title,
   * company, link, description), the dates/city and the item controls all live
   * on the first part, so a continuation renders only its bullet slice — the
   * empty date column keeps its width so the list aligns across the page break.
   */
  continuation?: boolean;
  /**
   * STACKED composition (the timeline-panel design, exclusive to it): the title
   * over ONE «start – end | company · city» meta row over the bullets — no date
   * column and no per-entry rail, at the design's pinned type (12.5px/700 title,
   * 11px meta, 11.5px bullets — the `STACKED_*` paint↔reserve constants). Must
   * match the flow's `LayoutMetrics.stackedEntries`, exactly like Education.
   */
  stacked?: boolean;
  /** Prose line-height for the stacked composition's description + bullets, when
   *  a design pins it (the reference's 1.6). Mirrors
   *  `LayoutMetrics.proseLineHeights.body`. */
  proseLineHeight?: string;
}

export const ExperienceItemBlock = memo(function ExperienceItemBlock({
  item,
  direction,
  accentColor,
  markerColor,
  showMonth = true,
  monthFormat = "name",
  respRange,
  continuation = false,
  stacked = false,
  proseLineHeight,
}: ExperienceItemBlockProps) {
  const { updateExperience, removeExperience } = useExperience();
  // ATS Friendly mode drops the small inline glyphs (location pin, link icon) but
  // keeps their text (city, URL) as real content.
  const ats = useAtsMode();
  const accent = `var(--rz-secondary, ${accentColor})`;
  // Derived display only — the store keeps the full ISO date either way.
  const dateFormat = periodDateFormat(showMonth, monthFormat);
  // The SAME width the pagination estimator reserves, so the main column's wrap
  // width and the estimate can never diverge.
  const dateColumnWidth = `${periodDateColumnMm(showMonth, monthFormat)}mm`;
  // Every rendered field of a visible section validates: the block only renders
  // for a visible section (buildBlocks filters on `visible`), and each optional
  // field renders only when its toggle is on — so a rendered empty field is
  // always an enabled empty field, flagged even in a fully-blank entry (which
  // would otherwise vanish from the PDF).
  const validate = true;

  const setPeriod = (patch: Partial<ExperienceItem["period"]>) => {
    // Merge against the LIVE store value, not the `item.period` prop, which is a
    // stale closure. The end-date DateField fires `onChange` (sets `end`) and
    // `onPresentChange(false)` back-to-back in the same tick; a prop-based merge
    // would re-introduce the pre-pick `end` on the second call, so the End Date
    // never persists. Reading live state keeps both updates applied.
    const live = useResumeStore
      .getState()
      .resume.experience.find((e) => e.id === item.id)?.period;
    updateExperience(item.id, { period: { ...(live ?? item.period), ...patch } });
  };

  if (stacked) {
    // The timeline-panel composition: title / «start – end | company · city» /
    // bullets, all spanning the flow width at the design's pinned type. The
    // whole meta row sits in the neutral muted tier, exactly as the reference
    // paints its one-tier «۱۴۰۲ – اکنون | شرکت فناوری آسا» line.
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
        <VStack align="stretch" flex="1" minW="0" gap="0.5" pe="6" dir={direction}>
          {continuation ? null : (
            <>
              <EditableText
                value={item.jobTitle}
                onChange={(value) => updateExperience(item.id, { jobTitle: value })}
                placeholder={t.experience.jobTitlePlaceholder}
                validate={validate}
                fontWeight="700"
                fontSize="0.8333em"
                letterSpacing="0.03em"
                color="var(--rz-secondary, #3f3f46)"
                truncateEnd
              />
              <HStack gap="1" align="baseline" flexWrap="wrap" minW="0" color="fg.muted">
                <Box flexShrink={0}>
                  <DateField
                    monthYear
                    format={dateFormat}
                    value={item.period.start}
                    onChange={(value) => setPeriod({ start: value })}
                    placeholder={t.experience.periodStart}
                    validate={validate}
                    fontSize="0.7333em"
                    fontWeight="normal"
                  />
                </Box>
                {/* The dash renders only when BOTH ends exist, so the print
                    surface can never show an orphaned separator. */}
                {item.period.start && (item.period.end || item.period.current) ? (
                  <Box as="span" fontSize="0.7333em" flexShrink={0}>
                    –
                  </Box>
                ) : null}
                <Box flexShrink={0}>
                  <DateField
                    monthYear
                    format={dateFormat}
                    value={item.period.end}
                    onChange={(value) => setPeriod({ end: value })}
                    placeholder={t.experience.periodEnd}
                    present={item.period.current}
                    onPresentChange={(current) => setPeriod({ current })}
                    validate={validate}
                    fontSize="0.7333em"
                    fontWeight="normal"
                  />
                </Box>
                <Box as="span" fontSize="0.7333em" flexShrink={0} aria-hidden>
                  |
                </Box>
                <EditableText
                  value={item.companyName}
                  onChange={(value) => updateExperience(item.id, { companyName: value })}
                  placeholder={t.experience.companyNamePlaceholder}
                  validate={validate}
                  fontSize="0.7333em"
                  color="fg.muted"
                  autoWidth
                />
                <HStack gapX={1} minW="0">
                  {ats ? null : <Icon as={TbCurrentLocationFilled} color="fg.muted" boxSize={3} />}
                  <EditableText
                    value={item.city}
                    onChange={(value) => updateExperience(item.id, { city: value })}
                    placeholder={t.experience.cityPlaceholder}
                    validate={validate}
                    fontSize="0.7333em"
                    color="fg.muted"
                    autoWidth
                  />
                </HStack>
              </HStack>

              {shouldRenderProjectLink(item) ? (
                <Stack direction="row" gap="1" align="center">
                  {ats ? null : item.link.trim().length > 0 ? (
                    <Link
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      fontSize="0.7667em"
                      color={accent}
                      flexShrink={0}
                      textDecoration="none"
                      _hover={{ textDecoration: "underline" }}
                    >
                      <LinkIcon />
                    </Link>
                  ) : (
                    <chakra.span fontSize="0.7667em" color={accent} display="inline-flex" flexShrink={0}>
                      <LinkIcon />
                    </chakra.span>
                  )}
                  <Box minWidth="0" fontSize="0.7667em">
                    <chakra.span style={{ direction: "ltr", unicodeBidi: "isolate" }}>
                      <EditableText
                        value={item.link}
                        onChange={(value) =>
                          updateExperience(item.id, { link: sanitizeProjectUrl(value) })
                        }
                        placeholder={t.experience.projectLinkPlaceholder}
                        validate={validate}
                        fontSize="1em"
                        color={accent}
                        autoWidth
                      />
                    </chakra.span>
                  </Box>
                </Stack>
              ) : null}

              <Box lineHeight={proseLineHeight}>
                <EditableText
                  value={item.projectDescription}
                  onChange={(value) => updateExperience(item.id, { projectDescription: value })}
                  placeholder={t.experience.projectDescriptionPlaceholder}
                  validate={validate}
                  multiline
                  fontSize="0.7667em"
                  color="var(--rz-body, #3f3f46)"
                />
              </Box>
            </>
          )}
          <ResponsibilityListEditor
            experienceId={item.id}
            responsibilities={
              respRange
                ? item.responsibilities.slice(respRange.start, respRange.end)
                : item.responsibilities
            }
            accentColor={accentColor}
            markerColor={markerColor}
            validate={validate}
            fontSize="0.7667em"
            markerFontSize="0.7667em"
            topGap="6px"
            rowGap="3px"
            lineHeight={proseLineHeight}
          />
        </VStack>

        {continuation ? null : (
          <Box className="no-print" display="flex" position="absolute" insetInlineEnd="0" top="0">
            <SectionOptionsGear sectionType="experience" item={item} />
            <IconButton
              aria-label={t.experience.removeEntry}
              {...itemRemoveButtonProps}
              onClick={() => removeExperience(item.id)}
            >
              <TrashIcon />
            </IconButton>
          </Box>
        )}
      </HStack>
    );
  }

  return (
    <HStack
      className="group"
      align={"flex-start"}
      justify={"space-between"}
      position="relative"
      dir={direction}
      pb="1.5"
      borderRadius="md"
      _hover={ITEM_HOVER_OUTLINE}
    >
      {/* dir=ltr forces the date column to the left for every entry, regardless
          of the entry's own text direction, so the timeline reads consistently. */}

      <HStack w={"full"} align="flex-start" gap="3" dir="rtl">
        {/* Date / location column (always on the left). Its width follows the
            date text's length class — month name, month number or bare year —
            so the gap to the entry content stays proportionate. */}
        <VStack
          width={dateColumnWidth}
          dir={direction}
          gap={1}
        >
          {continuation ? null : (
            <>
              <DateField
                monthYear
                format={dateFormat}
                value={item.period.start}
                onChange={(value) => setPeriod({ start: value })}
                placeholder={t.experience.periodStart}
                validate={validate}
                fontWeight={"bold"}
                fontSize={"xs"}
                color="var(--rz-secondary, #3f3f46)"
              />
              {/* End date is always present; «تا اکنون» (in its popover) marks an
                  ongoing role via period.current instead of picking an end month. */}
              <DateField
                monthYear
                format={dateFormat}
                value={item.period.end}
                onChange={(value) => setPeriod({ end: value })}
                placeholder={t.experience.periodEnd}
                present={item.period.current}
                onPresentChange={(current) => setPeriod({ current })}
                validate={validate}
                fontWeight={"bold"}
                color="var(--rz-secondary, #3f3f46)"
                fontSize={"xs"}
              />

              <HStack gapX={1} >
                {ats ? null : <Icon as={TbCurrentLocationFilled} color="fg.muted" boxSize={3} />}
                <EditableText
                  value={item.city}
                  onChange={(value) => updateExperience(item.id, { city: value })}
                  placeholder={t.experience.cityPlaceholder}
                  validate={validate}
                  fontSize="xs"
                  color="fg.muted"
                />
              </HStack>
            </>
          )}
        </VStack>

        {/* Timeline rail */}
        <TimelineRail accentColor={markerColor ?? accentColor} />

        {/* Main column */}
        <VStack align="stretch" flex="1" minW="0" gap="0.5" pe="6" dir={direction}>
          {continuation ? null : (
            <>
          <EditableText
            value={item.jobTitle}
            onChange={(value) => updateExperience(item.id, { jobTitle: value })}
            placeholder={t.experience.jobTitlePlaceholder}
            validate={validate}
            fontWeight="600"
            fontSize="sm"
            color="var(--rz-secondary, #3f3f46)"
            // Same treatment as SecondaryTitleField: base direction follows the
            // SECTION direction — no dir="auto", which misreads Latin/digit-
            // initial Persian titles as LTR — plus end-ellipsis on overflow.
            truncateEnd
          />
          <SecondaryTitleField
            value={item.companyName}
            onChange={(value) =>
              updateExperience(item.id, { companyName: value })
            }
            placeholder={t.experience.companyNamePlaceholder}
            accentColor={accentColor}
            validate={validate}
          />

          {/* Faithful copy of the Projects link row (see ProjectItemBlock for
              the full rationale): the row exists iff the shared predicate says
              so — the estimator counts it with the same call — the icon carries
              the live anchor, and only the URL glyphs are bidi-isolated LTR. */}
          {shouldRenderProjectLink(item) ? (
            <Stack direction="row" gap="1" align="center">
              {ats ? null : item.link.trim().length > 0 ? (
                <Link
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  fontSize={SIZE_EM.xs}
                  color={accent}
                  flexShrink={0}
                  textDecoration="none"
                  _hover={{ textDecoration: "underline" }}
                >
                  <LinkIcon />
                </Link>
              ) : (
                // No stored URL yet: the icon is inert (never <a href=""> or
                // <a href="#">) and the field shows its placeholder.
                <chakra.span
                  fontSize={SIZE_EM.xs}
                  color={accent}
                  display="inline-flex"
                  flexShrink={0}
                >
                  <LinkIcon />
                </chakra.span>
              )}
              {/* Body-sized so this block's own strut is the 18px EM_BODY line the
                  estimator prices, not the inherited 1em's 22.5px (see the
                  ProjectItemBlock original); the field takes "1em" of the box. */}
              <Box minWidth="0" fontSize={SIZE_EM.xs}>
                <chakra.span style={{ direction: "ltr", unicodeBidi: "isolate" }}>
                  <EditableText
                    value={item.link}
                    onChange={(value) =>
                      updateExperience(item.id, { link: sanitizeProjectUrl(value) })
                    }
                    placeholder={t.experience.projectLinkPlaceholder}
                    validate={validate}
                    fontSize="1em"
                    color={accent}
                    autoWidth
                  />
                </chakra.span>
              </Box>
            </Stack>
          ) : null}

          <EditableText
            value={item.projectDescription}
            onChange={(value) =>
              updateExperience(item.id, { projectDescription: value })
            }
            placeholder={t.experience.projectDescriptionPlaceholder}
            validate={validate}
            multiline
            fontSize="xs"
            color="var(--rz-body, #3f3f46)"
          />
            </>
          )}
          <ResponsibilityListEditor
            experienceId={item.id}
            responsibilities={
              respRange
                ? item.responsibilities.slice(respRange.start, respRange.end)
                : item.responsibilities
            }
            accentColor={accentColor}
            markerColor={markerColor}
            validate={validate}
          />
        </VStack>
      </HStack>

      {/* Item chrome overlay — off the layout flow (content clears it via the
          main column's pe="6"). DOM order gear→trash keeps the trash flush at
          the inline-end corner it has always occupied (mirrors ProjectItemBlock).
          A split entry carries it once, on the head part. */}
      {continuation ? null : (
        <Box
          className="no-print"
          display="flex"
          position="absolute"
          insetInlineEnd="0"
          top="0"
        >
          <SectionOptionsGear sectionType="experience" item={item} />
          <IconButton
            aria-label={t.experience.removeEntry}
            {...itemRemoveButtonProps}
            onClick={() => removeExperience(item.id)}
          >
            <TrashIcon />
          </IconButton>
        </Box>
      )}
    </HStack>
  );
});
