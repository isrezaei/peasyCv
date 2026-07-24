"use client";

import { memo, useCallback } from "react";
import { Box, HStack, VStack } from "@chakra-ui/react";
import { useAtsMode } from "@/hooks/store/useAtsMode";
import { useExperience } from "@/hooks/store/useExperience";
import { useBulletListEditing } from "@/hooks/resume/useBulletListEditing";
import { t } from "@/lib/i18n";
import type { ID, ResponsibilityItem } from "@/types";
import { RichTextField } from "./RichTextField";

interface ResponsibilityListEditorProps {
  experienceId: ID;
  responsibilities: ResponsibilityItem[];
  accentColor: string;
  /** Decorative colour for the bullet markers; unset falls back to the accent. */
  markerColor?: string;
  /** Flag empty bullets when the parent experience entry is being validated. */
  validate?: boolean;
  /** Bullet text size (default the shared 0.8em); a template pins a design's
   *  exact scale — the timeline-panel reference's 11.5px rows. */
  fontSize?: string;
  /** Marker glyph size (default the fixed `sm` rem token). A design that scales
   *  its bullets passes the SAME em as `fontSize`, so the marker tracks the text
   *  and the row loses the fixed 21px glyph floor the estimator prices. */
  markerFontSize?: string;
  /**
   * List top margin / inter-row gap. Defaults are the shared Chakra SPACING
   * TOKENS (`4` = 1rem, `1` = 0.25rem) — deliberately the tokens, not their
   * 16px/4px resolutions, so the default output is byte-identical CSS for every
   * other template even if the document root font-size is not 16px. The
   * timeline-panel reference pins literal `6px` / `3px`.
   */
  topGap?: string;
  rowGap?: string;
  /** Prose line-height, when a design pins it away from the theme's slider (the
   *  reference's 1.6). Inherited by the rows AND their markers. Must mirror
   *  `LayoutMetrics.proseLineHeights.body`. */
  lineHeight?: string;
}

/** A Work-Experience entry always keeps at least one bullet line, so the list can
 *  never be Backspace-deleted (or loaded) into an invalid empty state. */
const MIN_RESPONSIBILITIES = 1;

/**
 * The Work-Experience bullet list: the shared keyboard-driven list behavior
 * (see {@link useBulletListEditing}) over RichTextField lines, so bullets can
 * carry inline bold/italic/underline.
 */
export const ResponsibilityListEditor = memo(function ResponsibilityListEditor({
  experienceId,
  responsibilities,
  accentColor,
  markerColor,
  validate,
  fontSize = "0.8em",
  markerFontSize = "sm",
  topGap = "4",
  rowGap = "1",
  lineHeight,
}: ResponsibilityListEditorProps) {
  const { addResponsibility, addResponsibilityAfter, updateResponsibility, removeResponsibility } =
    useExperience();
  // ATS Friendly mode: the "•" is a graphic bullet, so it is dropped — the
  // responsibility text itself stays as a plain line.
  const ats = useAtsMode();

  const { registerHandle, handleEnter, handleBackspaceWhenEmpty } = useBulletListEditing({
    items: responsibilities,
    minItems: MIN_RESPONSIBILITIES,
    addFirst: useCallback(() => addResponsibility(experienceId), [addResponsibility, experienceId]),
    addAfter: useCallback(
      (afterId: ID) => addResponsibilityAfter(experienceId, afterId),
      [addResponsibilityAfter, experienceId],
    ),
    remove: useCallback(
      (id: ID) => removeResponsibility(experienceId, id),
      [removeResponsibility, experienceId],
    ),
  });

  return (
    <VStack align="stretch" gap={rowGap} mt={topGap} lineHeight={lineHeight}>
      {responsibilities.map((responsibility, index) => (
        <HStack key={responsibility.id} align="start" gap="1.5">
          {ats ? null : (
            <Box
              as="span"
              color={markerColor ?? accentColor}
              fontSize={markerFontSize}
              // Follows the list's pinned prose line-height when there is one, so
              // the glyph sits on the row's own baseline; otherwise the shared 1.5.
              lineHeight={lineHeight ?? "1.5"}
              aria-hidden
              flexShrink={0}
            >
              •
            </Box>
          )}
          {/* Enter adds the next bullet; Backspace on an empty bullet removes it. */}
          <RichTextField
            ref={(handle) => registerHandle(responsibility.id, handle)}
            value={responsibility.text}
            onChange={(value) => updateResponsibility(experienceId, responsibility.id, value)}
            placeholder={t.experience.responsibilityPlaceholder}
            validate={validate}
            fontSize={fontSize}
            color="var(--rz-body, #3f3f46)"
            onEnter={() => handleEnter(responsibility.id)}
            onBackspaceWhenEmpty={() => handleBackspaceWhenEmpty(index, responsibility.id)}
          />
        </HStack>
      ))}
    </VStack>
  );
});
