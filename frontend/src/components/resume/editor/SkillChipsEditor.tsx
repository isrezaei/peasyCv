"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Box, HStack, Icon, IconButton, Wrap } from "@chakra-ui/react";
import { PlusIcon, TrashIcon } from "@/components/ui/icons";
import { useAtsMode } from "@/hooks/store/useAtsMode";
import { useSkills } from "@/hooks/store/useSkills";
import { RADII } from "@/lib/design/tokens";
import { t } from "@/lib/i18n";
import { useResumeStore } from "@/store/useResumeStore";
import type { ID, SkillItem, SkillMeterVariant } from "@/types";
import { EditableText, type EditableTextHandle } from "./EditableText";
import { nestedItemRemoveButtonProps } from "./HoverFrame";
import { LanguageLevelMeter, PILL_TRACK_PX } from "./LanguageLevelMeter";
import { TbSquareRoundedMinus, TbSquareRoundedMinusFilled } from "react-icons/tb";

interface SkillChipsEditorProps {
  groupId: ID;
  skills: SkillItem[];
  /** Light vs dark surrounding surface — drives the tag's underline tint so it
   *  stays a quiet rule on either surface. */
  tone?: "onLight" | "onDark";
  accentColor: string;
  /** Decorative colour for the level-meter fill; unset falls back to the accent. */
  markerColor?: string;
  /** Section-wide: whether each tag carries the 1–5 level meter. */
  showLevel?: boolean;
  meterVariant?: SkillMeterVariant;
  /** Flag empty skill names when the parent group is being validated. */
  validate?: boolean;
  /**
   * When set, tags render as FILLED PILLS (this colour is the fill) instead of the
   * default underline style — the header-band template passes its harmonised card
   * wash so skills read as the reference's `#EAEFE0` chips. Unset keeps the shared
   * underline tag used by every other template, byte-identical.
   */
  chipFill?: string;
}

/**
 * Skill tags in the redesigned underline style: each skill reads as emphasised
 * text sitting on a quiet base rule (no pill fill, no radius), wrapping
 * horizontally. The rule BLENDS with whatever surface it sits on — a light
 * alpha on a dark column, a dark alpha on the page — and each tag AUTO-SIZES to
 * its skill name (the input grows/shrinks to its content).
 */
export const SkillChipsEditor = memo(function SkillChipsEditor({
  groupId,
  skills,
  tone = "onLight",
  accentColor,
  markerColor,
  showLevel = false,
  meterVariant = "line",
  validate,
  chipFill,
}: SkillChipsEditorProps) {
  const { addSkillAfter, setSkillLevel, updateSkill, removeSkill } = useSkills();

  // Adding a skill must land the caret INSIDE the new tag's input (typing after a
  // click on «+» goes into the name, and Enter there chains the next tag) — the
  // store insert alone would leave focus on the + button, minting dead empty tags.
  const chipHandles = useRef(new Map<ID, EditableTextHandle>());
  const [pendingFocusId, setPendingFocusId] = useState<ID | null>(null);
  useEffect(() => {
    if (!pendingFocusId) return;
    chipHandles.current.get(pendingFocusId)?.focusEnd();
    setPendingFocusId(null);
  }, [pendingFocusId]);
  const addAndFocus = (afterId: ID) => setPendingFocusId(addSkillAfter(groupId, afterId));

  // A tag abandoned with no name is dropped the moment focus leaves it, so an
  // aborted add never leaves a permanent empty chip behind (or in the print).
  // The input's own blur flushes its deferred value to the store BEFORE this
  // bubbled handler runs, so the store read sees the final name.
  const discardIfEmpty = (skillId: ID) => {
    const group = useResumeStore.getState().resume.skills.find((g) => g.id === groupId);
    if (group?.skills.find((s) => s.id === skillId)?.name.trim() === "") {
      removeSkill(groupId, skillId);
    }
  };

  const onDark = tone === "onDark";
  // ATS Friendly mode strips the tag's graphics (base rule + level meter) so
  // each skill reads as plain text; the name field itself is unchanged and prints
  // as an extractable text node.
  const ats = useAtsMode();
  const tagBorder = ats ? "transparent" : onDark ? "whiteAlpha.400" : "blackAlpha.200";
  const addBorder = onDark ? "whiteAlpha.400" : "blackAlpha.200";
  const addHoverBg = onDark ? "whiteAlpha.100" : "blackAlpha.50";
  // FILLED-PILL mode (header-band): the reference's #EAEFE0 chip — a soft fill,
  // 6px radius, 4×9px padding, 10px/500 text — replacing the underline base rule.
  // ATS keeps the fill off so tags stay plain extractable text. Unset → the shared
  // underline path, byte-identical for every other template.
  const filled = Boolean(chipFill) && !ats;
  const tagStyle = filled
    ? { bg: chipFill, color: accentColor, borderRadius: "6px", paddingBlock: "4px", paddingInline: "9px", gap: "5px" }
    : { gap: "6px", height: "30px", paddingInline: "2px", borderBottomWidth: "1.5px", borderBottomColor: tagBorder };

  return (
    <Wrap gap={filled ? "6px" : "12px"} rowGap={filled ? "6px" : "8px"} mt={filled ? "6px" : "8px"} align="center">
      {skills.map((skill) => (
        <HStack
          key={skill.id}
          className="group/skill"
          // The tag can never outgrow its row: an unbreakable 250-char name
          // ellipsizes inside the tag instead of painting past the A4 frame.
          minW="0"
          maxW="100%"
          {...tagStyle}
          onBlur={(event) => {
            if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
            discardIfEmpty(skill.id);
          }}
        >
          <EditableText
            value={skill.name}
            onChange={(value) => updateSkill(groupId, skill.id, value)}
            placeholder={t.skills.skillPlaceholder}
            validate={validate}
            fontSize={filled ? "0.667em" : "xs"}
            fontWeight={filled ? "500" : "600"}
            color="currentColor"
            // Bidi-isolate the name from the RTL page so an LTR token («C++»)
            // resolves its own base direction and reads left-to-right.
            dir="auto"
            autoWidth
            truncateEnd
            handleRef={(handle) => {
              if (handle) chipHandles.current.set(skill.id, handle);
              else chipHandles.current.delete(skill.id);
            }}
            onEnter={() => addAndFocus(skill.id)}
          />
          {showLevel && !ats && (
            <Box flexShrink={0} width={meterVariant === "line" ? `${PILL_TRACK_PX}px` : "auto"}>
              <LanguageLevelMeter
                level={skill.level}
                accentColor={markerColor ?? accentColor}
                variant={meterVariant}
                editable
                onChange={(level) => setSkillLevel(groupId, skill.id, level)}
              />
            </Box>
          )}
          {/* Standard hover trash — the same control as every other subsection
              item, revealed by this tag's own named hover group. */}
          <Icon
            aria-label={t.skills.removeSkill}
            {...nestedItemRemoveButtonProps}
            opacity={1}
            flexShrink={0}
            onClick={() => removeSkill(groupId, skill.id)}
            as={TbSquareRoundedMinus}
            boxSize={4}

          />
        </HStack>
      ))}
      {/* Icon-only add button (no text label; «افزودن مهارت» stays as the aria-label).
          It renders AFTER the mapped tags, so it always trails the last skill — a
          newly added skill slots in right before it, keeping it at the end of the list. */}
      <IconButton
        aria-label={t.skills.addSkill}
        size="2xs"
        variant="outline"
        colorPalette="gray"
        width="26px"
        height="26px"
        borderRadius={RADII.full}
        borderWidth="1.5px"
        borderStyle="dashed"
        borderColor={addBorder}
        color="currentColor"
        opacity={0.75}
        className="no-print"
        _hover={{ opacity: 1, bg: addHoverBg }}
        onClick={() => addAndFocus(skills[skills.length - 1]?.id ?? "")}
      >
        <PlusIcon />
      </IconButton>
    </Wrap>
  );
});
