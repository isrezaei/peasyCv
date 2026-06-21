"use client";

import { memo } from "react";
import { Box, HStack, IconButton, VStack } from "@chakra-ui/react";
import { TrashIcon } from "@/components/ui/icons";
import { useEducation } from "@/hooks/store/useEducation";
import { t } from "@/lib/i18n";
import type { Direction, EducationItem } from "@/types";
import { DateField } from "./DateField";
import { EditableText } from "./EditableText";
import { SecondaryTitleField } from "./SecondaryTitleField";
import { TimelineRail } from "./TimelineRail";

interface EducationItemBlockProps {
  item: EducationItem;
  direction: Direction;
  accentColor: string;
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
}: EducationItemBlockProps) {
  const { updateEducation, removeEducation } = useEducation();

  return (
    <HStack className="group" align="flex-start" justify="space-between" position="relative" dir={direction} pb="2">
      <HStack w="full" align="flex-start" gap="3" dir="rtl">
        {/* Date / location column (always on the left, matching Experience). */}
        <VStack width="20mm" dir={direction} gap="1.5">
          <DateField
            value={item.startDate}
            onChange={(value) => updateEducation(item.id, { startDate: value })}
            placeholder={t.education.startDate}
          />
          <DateField
            value={item.endDate}
            onChange={(value) => updateEducation(item.id, { endDate: value })}
            placeholder={t.education.endDate}
          />
          <Box mt={2}>
            <EditableText
              value={item.city}
              onChange={(value) => updateEducation(item.id, { city: value })}
              placeholder={t.education.city}
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
            value={item.degree}
            onChange={(value) => updateEducation(item.id, { degree: value })}
            placeholder={t.education.degreePlaceholder}
            fontWeight="600"
            fontSize="sm"
            color="#3f3f46"
          />
          <SecondaryTitleField
            value={item.university}
            onChange={(value) => updateEducation(item.id, { university: value })}
            placeholder={t.education.universityPlaceholder}
            accentColor={accentColor}
            fontWeight="normal"
          />
          <EditableText
            value={item.gpa}
            onChange={(value) => updateEducation(item.id, { gpa: value })}
            placeholder={t.education.gpa}
            fontSize="xs"
            color="fg.muted"
          />
          <EditableText
            value={item.achievements}
            onChange={(value) => updateEducation(item.id, { achievements: value })}
            placeholder={t.education.achievements}
            multiline
            fontSize="xs"
          />
        </VStack>
      </HStack>

      <IconButton
        aria-label={t.education.removeEntry}
        size="2xs"
        variant="subtle"
        rounded="lg"
        colorPalette="red"
        className="no-print"
        onClick={() => removeEducation(item.id)}
      >
        <TrashIcon />
      </IconButton>
    </HStack>
  );
});
