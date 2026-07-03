"use client";

import { memo } from "react";
import { chakra, HStack, IconButton, Wrap } from "@chakra-ui/react";
import { PlusIcon } from "@/components/ui/icons";
import { useSkills } from "@/hooks/store/useSkills";
import { COLORS, RADII } from "@/lib/design/tokens";
import { t } from "@/lib/i18n";
import type { ID, SkillItem } from "@/types";
import { EditableText } from "./EditableText";

interface SkillChipsEditorProps {
  groupId: ID;
  skills: SkillItem[];
  /** Light vs dark surrounding surface — drives the chip's blended fill so it never
   *  reads as a bright box on a dark sidebar. */
  tone?: "onLight" | "onDark";
}

/**
 * Skill chips that BLEND with whatever surface they sit on: a translucent neutral
 * fill (light-alpha on a dark column, dark-alpha on a light page) with the
 * surrounding text colour — never a hard white box. Each chip also AUTO-SIZES to
 * its skill name (the input grows/shrinks to its content) instead of a fixed width.
 */
export const SkillChipsEditor = memo(function SkillChipsEditor({
  groupId,
  skills,
  tone = "onLight",
}: SkillChipsEditorProps) {
  const { addSkill, updateSkill, removeSkill } = useSkills();
  const onDark = tone === "onDark";
  const chipBg = onDark ? "whiteAlpha.200" : "blackAlpha.50";
  const chipBorder = onDark ? "whiteAlpha.300" : "blackAlpha.100";
  const addBorder = onDark ? "whiteAlpha.400" : "blackAlpha.200";
  const addHoverBg = onDark ? "whiteAlpha.100" : "blackAlpha.50";

  return (
    <Wrap gap="10px" mt="8px" align="center">
      {skills.map((skill) => (
        <HStack
          key={skill.id}
          className="group/chip"
          gap="6px"
          height="30px"
          paddingInlineStart="12px"
          paddingInlineEnd="6px"
          bg={chipBg}
          borderWidth="1px"
          borderColor={chipBorder}
          borderRadius="full"
        >
          <EditableText
            value={skill.name}
            onChange={(value) => updateSkill(groupId, skill.id, value)}
            placeholder={t.skills.skillPlaceholder}
            fontSize="xs"
            color="currentColor"
            autoWidth
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
            borderRadius={RADII.chipDelete}
            bg="transparent"
            color="currentColor"
            opacity={0.55}
            transition="background 0.12s, color 0.12s, opacity 0.12s"
            _hover={{ bg: COLORS.deleteBg, color: COLORS.deleteFg, opacity: 1 }}
            onClick={() => removeSkill(groupId, skill.id)}
            aria-label={t.skills.removeSkill}
          >
            ×
          </chakra.button>
        </HStack>
      ))}
      {/* Icon-only add button (no text label; «افزودن مهارت» stays as the aria-label).
          It renders AFTER the mapped chips, so it always trails the last skill — a
          newly added skill slots in right before it, keeping it at the end of the list. */}
      <IconButton
        aria-label={t.skills.addSkill}
        size="2xs"
        variant="outline"
        colorPalette="gray"
        width="30px"
        height="30px"
        borderRadius={RADII.full}
        borderWidth="1.5px"
        borderStyle="dashed"
        borderColor={addBorder}
        color="currentColor"
        opacity={0.75}
        className="no-print"
        _hover={{ opacity: 1, bg: addHoverBg }}
        onClick={() => addSkill(groupId)}
      >
        <PlusIcon />
      </IconButton>
    </Wrap>
  );
});
