"use client";

import { memo } from "react";
import { Box, Button, chakra, HStack, Wrap } from "@chakra-ui/react";
import { PlusIcon } from "@/components/ui/icons";
import { useSkills } from "@/hooks/store/useSkills";
import { COLORS, RADII, SHADOWS } from "@/lib/design/tokens";
import { t } from "@/lib/i18n";
import type { ID, SkillItem } from "@/types";
import { EditableText } from "./EditableText";

interface SkillChipsEditorProps {
  groupId: ID;
  skills: SkillItem[];
  accentColor: string;
  softColor: string;
}

/** White skill chips with a hairline ring and a small delete button (mock-exact). */
export const SkillChipsEditor = memo(function SkillChipsEditor({
  groupId,
  skills,
}: SkillChipsEditorProps) {
  const { addSkill, updateSkill, removeSkill } = useSkills();

  return (
    <Wrap gap="10px" mt="8px" align="center">
      {skills.map((skill) => (
        <HStack
          key={skill.id}
          className="group/chip"
          gap="8px"
          height="30px"
          paddingInlineStart="12px"
          paddingInlineEnd="6px"
          bg="white"
          style={{ borderRadius: RADII.control, boxShadow: SHADOWS.card }}
        >
          <EditableText
            value={skill.name}
            onChange={(value) => updateSkill(groupId, skill.id, value)}
            placeholder={t.skills.skillPlaceholder}
            fontSize="xs"
            color={COLORS.muted}
          />
          <chakra.button
            type="button"
            className="no-print"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            width="18px"
            height="18px"
            flexShrink={0}
            fontSize="11px"
            transition="background 0.12s, color 0.12s"
            style={{ borderRadius: RADII.chipDelete, background: COLORS.workspace, color: COLORS.muted }}
            _hover={{ bg: COLORS.deleteBg, color: COLORS.deleteFg }}
            onClick={() => removeSkill(groupId, skill.id)}
            aria-label={t.skills.removeSkill}
          >
            ×
          </chakra.button>
        </HStack>
      ))}
      <Button
        size="2xs"
        variant="ghost"
        colorPalette="gray"
        color="fg.muted"
        fontWeight="600"
        className="no-print"
        _hover={{ color: "accent.fg", bg: "accent.subtle" }}
        onClick={() => addSkill(groupId)}
      >
        <Box display="inline-flex">
          <PlusIcon />
        </Box>
        {t.skills.addSkill}
      </Button>
    </Wrap>
  );
});
