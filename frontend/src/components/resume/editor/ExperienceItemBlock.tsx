"use client";

import { memo } from "react";
import { Box, chakra, HStack, Icon, IconButton, Link, Stack, VStack } from "@chakra-ui/react";
import { LinkIcon, TrashIcon } from "@/components/ui/icons";
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
}

export const ExperienceItemBlock = memo(function ExperienceItemBlock({
  item,
  direction,
  accentColor,
  markerColor,
  showMonth = true,
  monthFormat = "name",
}: ExperienceItemBlockProps) {
  const { updateExperience, removeExperience } = useExperience();
  const accent = `var(--rz-secondary, ${accentColor})`;
  // Derived display only — the store keeps the full ISO date either way.
  const dateFormat = periodDateFormat(showMonth, monthFormat);
  // The SAME width the pagination estimator reserves, so the main column's wrap
  // width and the estimate can never diverge.
  const dateColumnWidth = `${periodDateColumnMm(showMonth, monthFormat)}mm`;

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
          <DateField
            monthYear
            format={dateFormat}
            value={item.period.start}
            onChange={(value) => setPeriod({ start: value })}
            placeholder={t.experience.periodStart}
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
            fontWeight={"bold"}
            color="var(--rz-secondary, #3f3f46)"
            fontSize={"xs"}
          />

          <HStack gapX={1} >
            <Icon as={TbCurrentLocationFilled}  color="fg.muted" boxSize={3} />
            <EditableText
              value={item.city}
              onChange={(value) => updateExperience(item.id, { city: value })}
              placeholder={t.experience.city}
              fontSize="xs"
              color="fg.muted"
            />
          </HStack>
        </VStack>

        {/* Timeline rail */}
        <TimelineRail accentColor={markerColor ?? accentColor} />

        {/* Main column */}
        <VStack align="stretch" flex="1" minW="0" gap="0.5" pe="6" dir={direction}>
          <EditableText
            value={item.jobTitle}
            onChange={(value) => updateExperience(item.id, { jobTitle: value })}
            placeholder={t.experience.jobTitlePlaceholder}
            fontWeight="600"
            fontSize="sm"
            color="var(--rz-secondary, #3f3f46)"
          />
          <SecondaryTitleField
            value={item.companyName}
            onChange={(value) =>
              updateExperience(item.id, { companyName: value })
            }
            placeholder={t.experience.companyNamePlaceholder}
            accentColor={accentColor}
          />

          {/* Faithful copy of the Projects link row (see ProjectItemBlock for
              the full rationale): the row exists iff the shared predicate says
              so — the estimator counts it with the same call — the icon carries
              the live anchor, and only the URL glyphs are bidi-isolated LTR. */}
          {shouldRenderProjectLink(item) ? (
            <Stack direction="row" gap="1" align="center">
              {item.link.trim().length > 0 ? (
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
              <Box minWidth="0">
                <chakra.span style={{ direction: "ltr", unicodeBidi: "isolate" }}>
                  <EditableText
                    value={item.link}
                    onChange={(value) =>
                      updateExperience(item.id, { link: sanitizeProjectUrl(value) })
                    }
                    placeholder={t.experience.projectLink}
                    fontSize="xs"
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
            placeholder={t.experience.projectDescription}
            multiline
            fontSize="xs"
            color="var(--rz-body, #3f3f46)"
          />
          <ResponsibilityListEditor
            experienceId={item.id}
            responsibilities={item.responsibilities}
            accentColor={accentColor}
            markerColor={markerColor}
          />
        </VStack>
      </HStack>

      {/* Item chrome overlay — off the layout flow (content clears it via the
          main column's pe="6"). DOM order gear→trash keeps the trash flush at
          the inline-end corner it has always occupied (mirrors ProjectItemBlock). */}
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
    </HStack>
  );
});
