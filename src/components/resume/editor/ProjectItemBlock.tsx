"use client";

import { memo } from "react";
import { Box, HStack, IconButton, VStack } from "@chakra-ui/react";
import { TrashIcon } from "@/components/ui/icons";
import { useProjects } from "@/hooks/store/useProjects";
import { t } from "@/lib/i18n";
import type { Direction, ProjectItem } from "@/types";
import { EditableText } from "./EditableText";

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
    <Box className="group" position="relative" dir={direction} pb="2">
      <VStack align="stretch" gap="0.5" pe="6">
        <HStack gap="2" align="baseline">
          <EditableText
            value={item.name}
            onChange={(value) => updateProject(item.id, { name: value })}
            placeholder={t.projects.namePlaceholder}
            fontWeight="bold"
            fontSize="sm"
          />
          <EditableText
            value={item.role}
            onChange={(value) => updateProject(item.id, { role: value })}
            placeholder={t.projects.rolePlaceholder}
            fontSize="xs"
            color={accentColor}
          />
        </HStack>
        <EditableText
          value={item.link}
          onChange={(value) => updateProject(item.id, { link: value })}
          placeholder={t.projects.linkPlaceholder}
          fontSize="xs"
          color="fg.muted"
        />
        <EditableText
          value={item.description}
          onChange={(value) => updateProject(item.id, { description: value })}
          placeholder={t.projects.descriptionPlaceholder}
          multiline
          fontSize="xs"
        />
      </VStack>

      <IconButton
        aria-label={t.projects.removeEntry}
        size="2xs"
        variant="ghost"
        colorPalette="red"
        className="no-print"
        position="absolute"
        insetInlineEnd="0"
        top="0"
        opacity="0"
        _groupHover={{ opacity: 1 }}
        onClick={() => removeProject(item.id)}
      >
        <TrashIcon />
      </IconButton>
    </Box>
  );
});
