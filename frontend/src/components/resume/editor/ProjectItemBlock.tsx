"use client";

import { memo } from "react";
import {Box, HStack, IconButton, Stack, VStack} from "@chakra-ui/react";
import { TrashIcon } from "@/components/ui/icons";
import { useProjects } from "@/hooks/store/useProjects";
import { t } from "@/lib/i18n";
import type { Direction, ProjectItem } from "@/types";
import { EditableText } from "./EditableText";
import { ITEM_HOVER_OUTLINE, itemRemoveButtonProps } from "./HoverFrame";

interface ProjectItemBlockProps {
  item: ProjectItem;
  direction: Direction;
  accentColor: string;
}

export const ProjectItemBlock = memo(function ProjectItemBlock({
  item,
  direction,
  accentColor,
}: ProjectItemBlockProps) {
  const { updateProject, removeProject } = useProjects();

  return (
    <Box
      className="group"
      position="relative"
      dir={direction}
      pb="2"
      borderRadius="md"
      _hover={ITEM_HOVER_OUTLINE}
    >
      <VStack align="stretch" gap="0.5" pe="6">
        <Stack gap={0.5} mb={1.5} align="baseline">
          <EditableText
            value={item.name}
            onChange={(value) => updateProject(item.id, { name: value })}
            placeholder={t.projects.namePlaceholder}
            fontWeight="bold"
            fontSize="sm"
            color={`var(--rz-secondary, ${accentColor})`}
          />
          {/*should remove*/}
          {/*<EditableText*/}
          {/*  value={item.role}*/}
          {/*  onChange={(value) => updateProject(item.id, { role: value })}*/}
          {/*  placeholder={t.projects.rolePlaceholder}*/}
          {/*  fontSize="xs"*/}
          {/*  color={`var(--rz-secondary, ${accentColor})`}*/}
          {/*/>*/}
          {/*should remove*/}
          <EditableText
              value={item.link}
              onChange={(value) => updateProject(item.id, { link: value })}
              placeholder={t.projects.linkPlaceholder}
              fontSize="xs"
              color={`var(--rz-secondary, ${accentColor})`}
          />
        </Stack>

        <EditableText
          value={item.description}
          onChange={(value) => updateProject(item.id, { description: value })}
          placeholder={t.projects.descriptionPlaceholder}
          multiline
          fontSize="xs"
          color="var(--rz-body, #3f3f46)"
        />
      </VStack>

      <IconButton
        aria-label={t.projects.removeEntry}
        {...itemRemoveButtonProps}
        position="absolute"
        insetInlineEnd="0"
        top="0"
        onClick={() => removeProject(item.id)}
      >
        <TrashIcon />
      </IconButton>
    </Box>
  );
});
