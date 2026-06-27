"use client";

import { memo } from "react";
import { Box, HStack, IconButton, VStack } from "@chakra-ui/react";
import { TrashIcon } from "@/components/ui/icons";
import { useSkills } from "@/hooks/store/useSkills";
import { t } from "@/lib/i18n";
import type { Direction, SkillGroup } from "@/types";
import { EditableText } from "./EditableText";
import { ITEM_HOVER_OUTLINE, itemRemoveButtonProps } from "./HoverFrame";
import { SkillChipsEditor } from "./SkillChipsEditor";

interface SkillGroupBlockProps {
  group: SkillGroup;
  direction: Direction;
  /** Light vs dark surrounding column — forwarded to the chips so they blend in. */
  tone?: "onLight" | "onDark";
}

export const SkillGroupBlock = memo(function SkillGroupBlock({
  group,
  direction,
  tone = "onLight",
}: SkillGroupBlockProps) {
  const { updateSkillGroup, removeSkillGroup } = useSkills();

  return (
    <Box
      className="group"
      position="relative"
      dir={direction}
      pb="2"
      borderRadius="md"
      _hover={ITEM_HOVER_OUTLINE}
    >
      <HStack justify="space-between" gap="2">
        <EditableText
          value={group.name}
          onChange={(value) => updateSkillGroup(group.id, value)}
          placeholder={t.skills.groupNamePlaceholder}
          fontWeight="500"
          fontSize="xs"
          color="currentColor"
        />
        <IconButton
          aria-label={t.skills.removeGroup}
          {...itemRemoveButtonProps}
          onClick={() => removeSkillGroup(group.id)}
        >
          <TrashIcon />
        </IconButton>
      </HStack>
      <VStack align="stretch" gap="0">
        <SkillChipsEditor groupId={group.id} skills={group.skills} tone={tone} />
      </VStack>
    </Box>
  );
});
