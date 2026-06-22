"use client";

import { memo, useCallback, useEffect, useRef } from "react";
import { Box, HStack, VStack } from "@chakra-ui/react";
import { useExperience } from "@/hooks/store/useExperience";
import { t } from "@/lib/i18n";
import type { ID, ResponsibilityItem } from "@/types";
import { RichTextField, type RichTextHandle } from "./RichTextField";

interface ResponsibilityListEditorProps {
  experienceId: ID;
  responsibilities: ResponsibilityItem[];
  accentColor: string;
}

/** A Work-Experience entry always keeps at least one bullet line, so the list can
 *  never be Backspace-deleted (or loaded) into an invalid empty state. */
const MIN_RESPONSIBILITIES = 1;

/**
 * Keyboard-driven bullet list (Notion-style) for a Work-Experience entry:
 *  - Enter inserts a new empty bullet right after the current one and focuses it.
 *  - Backspace on an *empty* bullet removes it (first, middle or last); the rest
 *    shift up and the caret lands at the end of the previous bullet — or on the
 *    new first bullet when the first was removed. The final bullet is never
 *    removed, so an entry always has somewhere to type.
 * Adding happens via Enter, so there is no separate "add item" button.
 */
export const ResponsibilityListEditor = memo(function ResponsibilityListEditor({
  experienceId,
  responsibilities,
  accentColor,
}: ResponsibilityListEditorProps) {
  const { addResponsibility, addResponsibilityAfter, updateResponsibility, removeResponsibility } =
    useExperience();

  // Per-line caret handles + the id to focus once the next render reflects an
  // Enter-insert or a Backspace-delete.
  const handles = useRef(new Map<ID, RichTextHandle | null>());
  const pendingFocusRef = useRef<ID | null>(null);

  // An entry must always offer at least one editable bullet — older saved data may
  // have none, and there is no add button to recover from empty. Seed one.
  useEffect(() => {
    if (responsibilities.length === 0) addResponsibility(experienceId);
  }, [responsibilities.length, experienceId, addResponsibility]);

  // After an insert/delete re-renders the list, move the caret to the target line.
  useEffect(() => {
    const target = pendingFocusRef.current;
    if (!target) return;
    pendingFocusRef.current = null;
    handles.current.get(target)?.focusEnd();
  }, [responsibilities]);

  const handleEnter = useCallback(
    (id: ID) => {
      // Insert a fresh empty bullet after this one and focus it next render.
      pendingFocusRef.current = addResponsibilityAfter(experienceId, id);
    },
    [experienceId, addResponsibilityAfter],
  );

  const handleBackspaceWhenEmpty = useCallback(
    (index: number, id: ID) => {
      // Never drop below the one-line minimum.
      if (responsibilities.length <= MIN_RESPONSIBILITIES) return;
      // Land focus on the previous line, or the new first line if this was first.
      pendingFocusRef.current =
        index === 0 ? responsibilities[1].id : responsibilities[index - 1].id;
      handles.current.delete(id);
      removeResponsibility(experienceId, id);
    },
    [experienceId, responsibilities, removeResponsibility],
  );

  return (
    <VStack align="stretch" gap="1" mt="0.5">
      {responsibilities.map((responsibility, index) => (
        <HStack key={responsibility.id} align="start" gap="1.5">
          <Box as="span" color={accentColor} fontSize="sm" lineHeight="1.5" aria-hidden flexShrink={0}>
            •
          </Box>
          {/* Enter adds the next bullet; Backspace on an empty bullet removes it. */}
          <RichTextField
            ref={(handle) => {
              if (handle) handles.current.set(responsibility.id, handle);
              else handles.current.delete(responsibility.id);
            }}
            value={responsibility.text}
            onChange={(value) => updateResponsibility(experienceId, responsibility.id, value)}
            placeholder={t.experience.responsibilityPlaceholder}
            fontSize="0.8em"
            onEnter={() => handleEnter(responsibility.id)}
            onBackspaceWhenEmpty={() => handleBackspaceWhenEmpty(index, responsibility.id)}
          />
        </HStack>
      ))}
    </VStack>
  );
});
