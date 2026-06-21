"use client";

import { memo } from "react";
import { Box, HStack, IconButton, VStack } from "@chakra-ui/react";
import { TrashIcon } from "@/components/ui/icons";
import { useSkills } from "@/hooks/store/useSkills";
import { t } from "@/lib/i18n";
import type { Direction, SkillGroup } from "@/types";
import { EditableText } from "./EditableText";
import { SkillChipsEditor } from "./SkillChipsEditor";

interface SkillGroupBlockProps {
  group: SkillGroup;
  direction: Direction;
  accentColor: string;
  softColor: string;
}

export const SkillGroupBlock = memo(function SkillGroupBlock({
  group,
  direction,
  accentColor,
  softColor,
}: SkillGroupBlockProps) {
  const { updateSkillGroup, removeSkillGroup } = useSkills();

  return (
    <Box className="group" position="relative" dir={direction} pb="2">
      <HStack justify="space-between" gap="2">
        <EditableText
          value={group.name}
          onChange={(value) => updateSkillGroup(group.id, value)}
          placeholder={t.skills.groupNamePlaceholder}
          fontWeight="500"
          fontSize="xs"
          color="#71717a"
        />
        <IconButton
          aria-label={t.skills.removeGroup}
          size="2xs"
          variant="ghost"
          colorPalette="red"
          className="no-print"
          opacity="0"
          _groupHover={{ opacity: 1 }}
          onClick={() => removeSkillGroup(group.id)}
        >
          <TrashIcon />
        </IconButton>
      </HStack>
      <VStack align="stretch" gap="0">
        <SkillChipsEditor
          groupId={group.id}
          skills={group.skills}
          accentColor={accentColor}
          softColor={softColor}
        />
      </VStack>
    </Box>
  );
});
