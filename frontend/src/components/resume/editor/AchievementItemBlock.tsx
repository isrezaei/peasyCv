"use client";

import { memo } from "react";
import { Box, chakra, HStack, IconButton, VStack } from "@chakra-ui/react";
import { AchievementDiamondIcon, TrashIcon } from "@/components/ui/icons";
import { useAchievements } from "@/hooks/store/useAchievements";
import { t } from "@/lib/i18n";
import { ACHIEVEMENT_ICON_BOX_PX } from "@/lib/pagination";
import type { AchievementItem, Direction } from "@/types";
import { EditableText } from "./EditableText";
import { ITEM_HOVER_OUTLINE, itemRemoveButtonProps } from "./HoverFrame";
import { SectionOptionsGear } from "./SectionOptionsGear";

interface AchievementItemBlockProps {
  item: AchievementItem;
  direction: Direction;
  accentColor: string;
  /** Decorative colour for the diamond icon; unset falls back to the
   *  `--rz-secondary` var (the classic decorative source, like the language
   *  meter fill), so vivid shows the palette's raw secondary automatically. */
  markerColor?: string;
  /** Section-wide display settings (the title is always rendered). */
  showDescription: boolean;
  showIcon: boolean;
  /**
   * PLAIN BULLET composition (the timeline-panel design, exclusive to it): a
   * "•" marker beside a body-tier run at the reference's 12.5px / 1.7 —
   * never the bold accent cell. Must match `LayoutMetrics.achievementBullets`.
   */
  plainBullet?: boolean;
  /** Pinned prose line-height (the reference's 1.7); unset keeps the theme's. */
  lineHeight?: string;
}

/**
 * One Key-Achievements grid cell: a diamond icon beside a text stack of the
 * bold title (primary entry-title tier) and the grey description. Both text
 * fields are MULTILINE editors so they wrap inside the cell like the reference
 * design; the icon is fixed-px structural chrome shared with the estimator
 * (`ACHIEVEMENT_ICON_BOX_PX`), never font-scaled.
 */
export const AchievementItemBlock = memo(function AchievementItemBlock({
  item,
  direction,
  accentColor,
  markerColor,
  showDescription,
  showIcon,
  plainBullet = false,
  lineHeight,
}: AchievementItemBlockProps) {
  const { updateAchievement, removeAchievement } = useAchievements();
  const accent = `var(--rz-secondary, ${accentColor})`;
  // Every rendered field of a visible section validates (see ExperienceItemBlock):
  // the description renders only when showDescription is on.
  const validate = true;

  if (plainBullet) {
    return (
      <Box
        className="group"
        position="relative"
        dir={direction}
        pb="1.5"
        borderRadius="md"
        lineHeight={lineHeight}
        _hover={ITEM_HOVER_OUTLINE}
      >
        <HStack align="flex-start" gap="1.5" pe="6">
          <Box
            as="span"
            color={markerColor ?? accent}
            fontSize="0.8333em"
            lineHeight="inherit"
            aria-hidden
            flexShrink={0}
          >
            •
          </Box>
          <VStack align="stretch" gap="0.5" flex="1" minW="0">
            <EditableText
              value={item.title}
              onChange={(value) => updateAchievement(item.id, { title: value })}
              placeholder={t.achievements.titlePlaceholder}
              validate={validate}
              multiline
              fontSize="0.8333em"
              color="var(--rz-body, #3f3f46)"
            />
            {showDescription ? (
              <EditableText
                value={item.description}
                onChange={(value) => updateAchievement(item.id, { description: value })}
                placeholder={t.achievements.descriptionPlaceholder}
                validate={validate}
                multiline
                fontSize="xs"
                color="var(--rz-body, #3f3f46)"
              />
            ) : null}
          </VStack>
        </HStack>

        <Box className="no-print" display="flex" position="absolute" insetInlineEnd="0" top="0">
          <SectionOptionsGear sectionType="achievements" item={item} />
          <IconButton
            aria-label={t.achievements.removeEntry}
            {...itemRemoveButtonProps}
            onClick={() => removeAchievement(item.id)}
          >
            <TrashIcon />
          </IconButton>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      className="group"
      position="relative"
      dir={direction}
      pb="1.5"
      borderRadius="md"
      _hover={ITEM_HOVER_OUTLINE}
    >
      <HStack align="flex-start" gap="2" pe="6">
        {showIcon ? (
          <chakra.span
            display="inline-flex"
            flexShrink={0}
            fontSize={`${ACHIEVEMENT_ICON_BOX_PX}px`}
            color={markerColor ?? accent}
            aria-hidden="true"
          >
            <AchievementDiamondIcon />
          </chakra.span>
        ) : null}
        <VStack align="stretch" gap="0.5" flex="1" minW="0">
          <EditableText
            value={item.title}
            onChange={(value) => updateAchievement(item.id, { title: value })}
            placeholder={t.achievements.titlePlaceholder}
            validate={validate}
            multiline
            fontSize="sm"
            fontWeight="bold"
            color={accent}
          />
          {showDescription ? (
            <EditableText
              value={item.description}
              onChange={(value) => updateAchievement(item.id, { description: value })}
              placeholder={t.achievements.descriptionPlaceholder}
              validate={validate}
              multiline
              fontSize="xs"
              color="var(--rz-body, #3f3f46)"
            />
          ) : null}
        </VStack>
      </HStack>

      {/* Item chrome overlay — off the layout flow (content clears it via the
          pre-existing pe="6"). DOM order gear→trash keeps the trash flush at
          the inline-end corner it has always occupied. */}
      <Box className="no-print" display="flex" position="absolute" insetInlineEnd="0" top="0">
        <SectionOptionsGear sectionType="achievements" item={item} />
        <IconButton
          aria-label={t.achievements.removeEntry}
          {...itemRemoveButtonProps}
          onClick={() => removeAchievement(item.id)}
        >
          <TrashIcon />
        </IconButton>
      </Box>
    </Box>
  );
});
