"use client";

import { memo } from "react";
import { Box, HStack, Icon, IconButton, Separator, Stack, VStack } from "@chakra-ui/react";
import { TrashIcon } from "@/components/ui/icons";
import { useExperience } from "@/hooks/store/useExperience";
import { useResumeStore } from "@/store/useResumeStore";
import { t } from "@/lib/i18n";
import type { Direction, ExperienceItem } from "@/types";
import { DateField } from "./DateField";
import { EditableText } from "./EditableText";
import { ITEM_HOVER_OUTLINE, itemRemoveButtonProps } from "./HoverFrame";
import { ResponsibilityListEditor } from "./ResponsibilityListEditor";
import { SecondaryTitleField } from "./SecondaryTitleField";
import { TimelineRail } from "./TimelineRail";
import { TbCurrentLocationFilled } from "react-icons/tb";

interface ExperienceItemBlockProps {
  item: ExperienceItem;
  direction: Direction;
  accentColor: string;
}

export const ExperienceItemBlock = memo(function ExperienceItemBlock({
  item,
  direction,
  accentColor,
}: ExperienceItemBlockProps) {
  const { updateExperience, removeExperience } = useExperience();

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
      pb="2"
      borderRadius="md"
      _hover={ITEM_HOVER_OUTLINE}
    >
      {/* dir=ltr forces the date column to the left for every entry, regardless
          of the entry's own text direction, so the timeline reads consistently. */}

      <HStack w={"full"} align="flex-start" gap="3" dir="rtl">
        {/* Date / location column (always on the left) */}
        <VStack
          width="25mm"
          dir={direction}
          gap={1}
        >
          <DateField
            monthYear
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
        <TimelineRail accentColor={accentColor} />

        {/* Main column */}
        <VStack align="stretch" flex="1" minW="0" gap="0.5" dir={direction}>
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

            <EditableText
              value={item.projectLink}
              onChange={(value) =>
                updateExperience(item.id, { projectLink: value })
              }
              placeholder={t.experience.projectLink}
              fontSize="2xs"
              color={"fg/50"}
            />

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
          />
        </VStack>
      </HStack>

      <IconButton
        aria-label={t.experience.removeEntry}
        {...itemRemoveButtonProps}
        onClick={() => removeExperience(item.id)}
      >
        <TrashIcon />
      </IconButton>
    </HStack>
  );
});
