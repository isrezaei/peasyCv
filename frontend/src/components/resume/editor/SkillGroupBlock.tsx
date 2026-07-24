"use client";

import { memo } from "react";
import { Box, IconButton } from "@chakra-ui/react";
import { TrashIcon } from "@/components/ui/icons";
import { useSkills } from "@/hooks/store/useSkills";
import { t } from "@/lib/i18n";
import type { Direction, SkillDisplayMode, SkillGroup, SkillMeterVariant } from "@/types";
import { EditableText } from "./EditableText";
import { ITEM_HOVER_OUTLINE, itemRemoveButtonProps } from "./HoverFrame";
import { SectionOptionsGear } from "./SectionOptionsGear";
import { SkillChipsEditor } from "./SkillChipsEditor";
import { SkillListEditor } from "./SkillListEditor";

interface SkillGroupBlockProps {
  group: SkillGroup;
  direction: Direction;
  /** Light vs dark surrounding column — forwarded to the tags so they blend in. */
  tone?: "onLight" | "onDark";
  accentColor: string;
  /** Decorative colour (bullets, meter fill); unset falls back to the accent. */
  markerColor?: string;
  /** Section-wide display settings — every group of the section obeys the same
   *  three values, controlled from the section's main menu. Only the title
   *  toggle is per group (this group's own gear). */
  displayMode: SkillDisplayMode;
  showLevel: boolean;
  meterVariant: SkillMeterVariant;
  /** When set, tags render as filled pills of this colour and the group label
   *  takes the reference's smaller size (header-band). Unset → shared underline. */
  chipFill?: string;
  /** Forwarded to the list mode: the timeline-panel panel's bare, marker-less
   *  skill lines (see {@link SkillListEditor}). Unset keeps the shared bullets. */
  plainList?: boolean;
  /**
   * Split-part slice for a plain list broken across pages (see the packer's
   * splitToFill): the half-open `[start, end)` skill range this page renders, and
   * whether it is a title-less continuation. Absent renders the whole group.
   */
  skillRange?: { start: number; end: number };
  continuation?: boolean;
}

/**
 * One skills group: an accent-tinted group title (hideable per group) over the
 * skills themselves, in the section-wide display mode — the wrapping underline
 * tags or the Work-Experience-style bullet list.
 */
export const SkillGroupBlock = memo(function SkillGroupBlock({
  group,
  direction,
  tone = "onLight",
  accentColor,
  markerColor,
  displayMode,
  showLevel,
  meterVariant,
  chipFill,
  plainList,
  skillRange,
  continuation = false,
}: SkillGroupBlockProps) {
  const { updateSkillGroup, removeSkillGroup } = useSkills();
  // Every rendered field of a visible section validates (see ExperienceItemBlock):
  // the group title renders only when showTitle is on, and each skill line is a
  // rendered field, so every empty one is an enabled empty field.
  const validate = true;
  // A split continuation page renders only its slice of the group's skills and
  // drops the (already-painted) group title, exactly like an Experience entry
  // broken between bullets. The whole group renders when no slice is given.
  const skillsToRender = skillRange
    ? group.skills.slice(skillRange.start, skillRange.end)
    : group.skills;
  const showTitle = group.showTitle && !continuation;

  return (
    <Box
      className="group"
      position="relative"
      dir={direction}
      pb="2"
      borderRadius="md"
      _hover={ITEM_HOVER_OUTLINE}
    >
      {showTitle && (
        // Room at the inline-end (2 × the 2xs control) so the hover gear/trash
        // never sit over the title text.
        <Box pe="12">
          <EditableText
            value={group.name}
            onChange={(value) => updateSkillGroup(group.id, { name: value })}
            placeholder={t.skills.groupNamePlaceholder}
            validate={validate}
            fontWeight="600"
            fontSize={chipFill ? "0.7em" : "xs"}
            color={markerColor ?? accentColor}
          />
        </Box>
      )}
      {displayMode === "list" ? (
        // List mode is text-only: the level meter is a tag-mode affordance.
        <SkillListEditor
          groupId={group.id}
          skills={skillsToRender}
          accentColor={accentColor}
          markerColor={markerColor}
          validate={validate}
          plain={plainList}
        />
      ) : (
        <SkillChipsEditor
          groupId={group.id}
          skills={group.skills}
          tone={tone}
          accentColor={accentColor}
          markerColor={markerColor}
          showLevel={showLevel}
          meterVariant={meterVariant}
          validate={validate}
          chipFill={chipFill}
        />
      )}

      {/* Item chrome overlay — off the layout flow, mirroring the Projects
          overlay: absolute at the inline-end corner, no-print, revealed by this
          group's own `.group` hover. DOM order gear→trash keeps the trash flush
          at the corner it has always occupied. */}
      <Box className="no-print" display="flex" position="absolute" insetInlineEnd="0" top="0">
        <SectionOptionsGear sectionType="skills" item={group} />
        <IconButton
          aria-label={t.skills.removeGroup}
          {...itemRemoveButtonProps}
          onClick={() => removeSkillGroup(group.id)}
        >
          <TrashIcon />
        </IconButton>
      </Box>
    </Box>
  );
});
