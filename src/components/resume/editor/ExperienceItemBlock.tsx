"use client";

import { memo } from "react";
import { Box, HStack, IconButton, VStack } from "@chakra-ui/react";
import { TrashIcon } from "@/components/ui/icons";
import { useExperience } from "@/hooks/store/useExperience";
import { t } from "@/lib/i18n";
import type { Direction, ExperienceItem } from "@/types";
import { DateField } from "./DateField";
import { EditableText } from "./EditableText";
import { ResponsibilityListEditor } from "./ResponsibilityListEditor";
import { SecondaryTitleField } from "./SecondaryTitleField";
import { TimelineRail } from "./TimelineRail";

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

  const setPeriod = (patch: Partial<ExperienceItem["period"]>) =>
    updateExperience(item.id, { period: { ...item.period, ...patch } });

  return (
    <HStack className="group" align={"flex-start"} justify={"space-between"} position="relative" dir={direction} pb="2">
      {/* dir=ltr forces the date column to the left for every entry, regardless
          of the entry's own text direction, so the timeline reads consistently. */}

      <HStack w={"full"} align="flex-start"  gap="3" dir="rtl">

          {/* Date / location column (always on the left) */}
          <VStack
              width="20mm"

              dir={direction}
              gap="1.5"

          >


                  <DateField
                      value={item.period.start}
                      onChange={(value) => setPeriod({ start: value })}
                      placeholder={t.experience.periodStart}
                  />
                  {!item.period.current ? (
                      <DateField
                          value={item.period.end}
                          onChange={(value) => setPeriod({ end: value })}
                          placeholder={t.experience.periodEnd}
                      />
                  ) : null}


              <Box mt={2}>
                  <EditableText
                      value={item.city}
                      onChange={(value) => updateExperience(item.id, { city: value })}
                      placeholder={t.experience.city}
                      fontSize="xs"
                      color="fg.muted"
                  />
              </Box>



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
            color="#3f3f46"
          />
          <SecondaryTitleField
            value={item.companyName}
            onChange={(value) => updateExperience(item.id, { companyName: value })}
            placeholder={t.experience.companyNamePlaceholder}
            accentColor={accentColor}
            fontWeight="normal"
          />
          {item.projectLink ? (
            <EditableText
              value={item.projectLink}
              onChange={(value) => updateExperience(item.id, { projectLink: value })}
              placeholder={t.experience.projectLink}
              fontSize="xs"
              color="fg.muted"
            />
          ) : null}
          <EditableText
            value={item.projectDescription}
            onChange={(value) => updateExperience(item.id, { projectDescription: value })}
            placeholder={t.experience.projectDescription}
            multiline
            fontSize="xs"
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
        size="2xs"
        variant="subtle"
        rounded={"lg"}
        colorPalette="red"
        className="no-print"
        onClick={() => removeExperience(item.id)}
      >
        <TrashIcon />
      </IconButton>
    </HStack>
  );
});
