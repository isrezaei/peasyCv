"use client";

import { memo } from "react";
import {Box, Button, HStack, Icon, IconButton, VStack} from "@chakra-ui/react";
import { PlusIcon } from "@/components/ui/icons";
import { useExperience } from "@/hooks/store/useExperience";
import { t } from "@/lib/i18n";
import type { ID, ResponsibilityItem } from "@/types";
import { EditableText } from "./EditableText";
import { TbMinus } from "react-icons/tb";

interface ResponsibilityListEditorProps {
  experienceId: ID;
  responsibilities: ResponsibilityItem[];
  accentColor: string;
}

export const ResponsibilityListEditor = memo(function ResponsibilityListEditor({
  experienceId,
  responsibilities,
  accentColor,
}: ResponsibilityListEditorProps) {
  const { addResponsibility, updateResponsibility, removeResponsibility } = useExperience();

  return (
    <VStack align="stretch" gap="1" mt="0.5">
      {responsibilities.map((responsibility) => (
        <HStack key={responsibility.id} align="start" gap="1.5" className="group/item">
            <IconButton
                aria-label={t.experience.removeResponsibility}
                size={"2xs"}
                variant="subtle"
                rounded={"lg"}
                colorPalette="red"
                className="no-print"
                flexShrink={0}
                onClick={() => removeResponsibility(experienceId, responsibility.id)}
            >
                <Icon as={TbMinus} boxSize={3}/>
            </IconButton>
          <Box as="span" color={accentColor} fontSize="sm" lineHeight="1.5" aria-hidden flexShrink={0}>
            •
          </Box>
          <EditableText
            multiline
            value={responsibility.text}
            onChange={(value) => updateResponsibility(experienceId, responsibility.id, value)}
            placeholder={t.experience.responsibilityPlaceholder}
            fontSize="xs"
          />
        </HStack>
      ))}
      <Button
        size="2xs"
        variant="subtle"
        colorPalette="blue"
        fontSize="2xs"
        fontWeight="medium"
        alignSelf="flex-start"
        className="no-print"
        _hover={{ color: "accent.fg", bg: "accent.subtle" }}
        onClick={() => addResponsibility(experienceId)}
      >
        <PlusIcon />
        {t.experience.addResponsibility}
      </Button>
    </VStack>
  );
});
