"use client";

import { memo } from "react";
import { HStack, Icon, IconButton, Stack, VStack } from "@chakra-ui/react";
import { TrashIcon } from "@/components/ui/icons";
import { useEducation } from "@/hooks/store/useEducation";
import { t } from "@/lib/i18n";
import type { Direction, EducationItem } from "@/types";
import { DateField } from "./DateField";
import { EditableText } from "./EditableText";
import { ITEM_HOVER_OUTLINE, itemRemoveButtonProps } from "./HoverFrame";
import { SecondaryTitleField } from "./SecondaryTitleField";
import { TimelineRail } from "./TimelineRail";
import { TbCurrentLocationFilled, TbMapPin, TbMapPinFilled } from "react-icons/tb";

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
    <HStack
      className="group"
      align="flex-start"
      justify="space-between"
      position="relative"
      dir={direction}
      pb="2"
      borderRadius="md"
      _hover={ITEM_HOVER_OUTLINE}
    >
      <HStack w="full" align="flex-start" gap="3" dir="rtl">
        {/* Date / location column (always on the left, matching Experience). */}
        <Stack width="25mm" dir={direction} gap={1}>
          <DateField
            monthYear
            value={item.startDate}
            onChange={(value) => updateEducation(item.id, { startDate: value })}
            placeholder={t.education.startDate}
            color="var(--rz-secondary, #3f3f46)"
            fontSize={"xs"}
            fontWeight={"bold"}
          />

          <DateField
            monthYear
            value={item.endDate}
            onChange={(value) => updateEducation(item.id, { endDate: value })}
            placeholder={t.education.endDate}
            color="var(--rz-secondary, #3f3f46)"
            fontSize={"xs"}
            fontWeight={"bold"}
          />

          <HStack gapX={1} >
            <Icon as={TbCurrentLocationFilled}  color="fg.muted" boxSize={3} />
            <EditableText
              value={item.city}
              onChange={(value) => updateEducation(item.id, { city: value })}
              placeholder={t.education.city}
              fontSize="2xs"
              color="fg.muted"
            />
          </HStack>
        </Stack>

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
            color="var(--rz-secondary, #3f3f46)"
          />
          <SecondaryTitleField
            value={item.university}
            onChange={(value) =>
              updateEducation(item.id, { university: value })
            }
            placeholder={t.education.universityPlaceholder}
            accentColor={accentColor}
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
            onChange={(value) =>
              updateEducation(item.id, { achievements: value })
            }
            placeholder={t.education.achievements}
            multiline
            fontSize="xs"
            color="var(--rz-body, #3f3f46)"
          />
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
