"use client";

import { memo, useCallback } from "react";
import { Box, HStack, IconButton, VStack } from "@chakra-ui/react";
import { TrashIcon } from "@/components/ui/icons";
import { useAtsMode } from "@/hooks/store/useAtsMode";
import { useSkills } from "@/hooks/store/useSkills";
import { useBulletListEditing } from "@/hooks/resume/useBulletListEditing";
import { t } from "@/lib/i18n";
import type { ID, SkillItem } from "@/types";
import { EditableText } from "./EditableText";
import { nestedItemRemoveButtonProps } from "./HoverFrame";

interface SkillListEditorProps {
  groupId: ID;
  skills: SkillItem[];
  accentColor: string;
  /** Decorative colour for the bullet markers; unset falls back to the accent,
   *  exactly like the Work-Experience bullets. */
  markerColor?: string;
  /** Flag empty skill names when the parent group is being validated. */
  validate?: boolean;
  /**
   * PLAIN list composition (the timeline-panel design's panel, exclusive to
   * it): no bullet markers, 11.5px rows with a 10px gap — the reference's bare
   * skill lines. Must match the flow's `LayoutMetrics.plainSkillList`.
   */
  plain?: boolean;
}

/** A skills group in list mode always keeps at least one line, so the list can
 *  never be deleted (or loaded) into an invalid empty state. */
const MIN_SKILLS = 1;

/**
 * The Skills LIST display mode: the shared keyboard-driven bullet-list behavior
 * (see {@link useBulletListEditing} — extracted from the Work-Experience
 * responsibilities editor) over single-line skill-name fields. List mode is
 * text-only — the level meter renders only in the tag (row) display mode.
 */
export const SkillListEditor = memo(function SkillListEditor({
  groupId,
  skills,
  accentColor,
  markerColor,
  validate,
  plain = false,
}: SkillListEditorProps) {
  const { addSkill, addSkillAfter, updateSkill, removeSkill } = useSkills();
  // ATS Friendly mode: the "•" is a graphic, so it is dropped — the skill name
  // itself stays as a plain extractable line.
  const ats = useAtsMode();

  const { registerHandle, handleEnter, handleBackspaceWhenEmpty } = useBulletListEditing({
    items: skills,
    minItems: MIN_SKILLS,
    addFirst: useCallback(() => addSkill(groupId), [addSkill, groupId]),
    addAfter: useCallback(
      (afterId: ID) => addSkillAfter(groupId, afterId),
      [addSkillAfter, groupId],
    ),
    remove: useCallback((id: ID) => removeSkill(groupId, id), [removeSkill, groupId]),
  });

  return (
    <VStack align="stretch" gap={plain ? "10px" : "1"} mt={plain ? "0" : "8px"}>
      {skills.map((skill, index) => (
        // Each line is its own named hover group so only ITS trash reveals.
        // The inline-end padding keeps the text clear of the overlaid control.
        <HStack
          key={skill.id}
          className="group/skill"
          position="relative"
          align="center"
          gap="1.5"
          pe="6"
        >
          {ats || plain ? null : (
            <Box
              as="span"
              color={markerColor ?? accentColor}
              fontSize="sm"
              lineHeight="1.5"
              aria-hidden
              flexShrink={0}
            >
              •
            </Box>
          )}
          {/* Enter adds the next line; Backspace on an empty line removes it. */}
          <EditableText
            handleRef={(handle) => registerHandle(skill.id, handle)}
            value={skill.name}
            onChange={(value) => updateSkill(groupId, skill.id, value)}
            placeholder={t.skills.skillPlaceholder}
            validate={validate}
            fontSize={plain ? "0.7667em" : "xs"}
            color="currentColor"
            inputEllipsis={plain}
            onEnter={() => handleEnter(skill.id)}
            onBackspaceWhenEmpty={() => handleBackspaceWhenEmpty(index, skill.id)}
          />
          {/* Standard hover trash (same control as every other subsection item),
              overlaid off the layout flow so the line height the pagination
              estimator prices is untouched. The last line stays undeletable,
              matching the Backspace minimum above. */}
          {skills.length > MIN_SKILLS ? (
            <Box
              className="no-print"
              position="absolute"
              insetInlineEnd="0"
              top="50%"
              transform="translateY(-50%)"
            >
              <IconButton
                aria-label={t.skills.removeSkill}
                {...nestedItemRemoveButtonProps}
                onClick={() => removeSkill(groupId, skill.id)}
              >
                <TrashIcon />
              </IconButton>
            </Box>
          ) : null}
        </HStack>
      ))}
    </VStack>
  );
});
