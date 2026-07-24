"use client";

import { useCallback, useEffect, useRef } from "react";
import type { ID } from "@/types";

/** The caret surface a list line must expose — satisfied by both RichTextField's
 *  `RichTextHandle` and EditableText's `EditableTextHandle`. */
export interface FocusableLineHandle {
  focusEnd: () => void;
}

interface BulletListEditingOptions<Item extends { id: ID }> {
  items: Item[];
  /** The list never drops below this many lines, so Backspace can't delete the
   *  list into an invalid empty state. */
  minItems: number;
  /** Seeds the first line when the list loads (or is loaded) empty — there is no
   *  separate "add item" button to recover from zero lines. */
  addFirst: () => void;
  /** Inserts a new empty line right after `afterId`; returns the new line's id. */
  addAfter: (afterId: ID) => ID;
  remove: (id: ID) => void;
}

/**
 * THE keyboard-driven bullet-list behavior (Notion-style), extracted from the
 * Work-Experience responsibilities editor so every list section shares one
 * implementation:
 *  - Enter inserts a new empty line right after the current one and focuses it.
 *  - Backspace on an *empty* line removes it (first, middle or last); the rest
 *    shift up and the caret lands at the end of the previous line — or on the
 *    new first line when the first was removed. The final `minItems` lines are
 *    never removed, so the list always has somewhere to type.
 * Adding happens via Enter, so there is no separate "add item" button.
 */
/**
 * The line to focus once the render that creates it commits. Module-scoped (one
 * caret exists) rather than per hook instance: an Enter at the page-bottom
 * boundary creates the new line inside a DIFFERENT entry's list (see
 * addResponsibilityAfter), so the claiming editor instance is not necessarily
 * the one that requested the focus — whichever instance holds the line's handle
 * claims and clears the request.
 */
let pendingFocusId: ID | null = null;

export function useBulletListEditing<Item extends { id: ID }>({
  items,
  minItems,
  addFirst,
  addAfter,
  remove,
}: BulletListEditingOptions<Item>) {
  // Per-line caret handles for this list instance.
  const handles = useRef(new Map<ID, FocusableLineHandle | null>());

  // The list must always offer at least one editable line — older saved data may
  // have none, and there is no add button to recover from empty. Seed one.
  useEffect(() => {
    if (items.length === 0) addFirst();
  }, [items.length, addFirst]);

  // After an insert/delete re-renders (or mounts) a list, move the caret to the
  // target line. Only the instance that actually holds the target's handle
  // clears the request, so a boundary-created line in a just-mounted sibling
  // entry is claimed by that entry's own list.
  useEffect(() => {
    if (pendingFocusId === null) return;
    const handle = handles.current.get(pendingFocusId);
    if (!handle) return;
    pendingFocusId = null;
    handle.focusEnd();
  }, [items]);

  /** Ref-callback body for each line's field: register on mount, drop on unmount. */
  const registerHandle = useCallback((id: ID, handle: FocusableLineHandle | null) => {
    if (handle) handles.current.set(id, handle);
    else handles.current.delete(id);
  }, []);

  const handleEnter = useCallback(
    (id: ID) => {
      // Insert a fresh empty line after this one and focus it next render. (At
      // the page-bottom boundary the store creates the line in a NEW sibling
      // entry instead — the returned id then belongs to that entry's list.)
      pendingFocusId = addAfter(id);
    },
    [addAfter],
  );

  const handleBackspaceWhenEmpty = useCallback(
    (index: number, id: ID) => {
      // Never drop below the minimum.
      if (items.length <= minItems) return;
      // Land focus on the previous line, or the new first line if this was first.
      pendingFocusId = index === 0 ? items[1].id : items[index - 1].id;
      handles.current.delete(id);
      remove(id);
    },
    [items, minItems, remove],
  );

  return { registerHandle, handleEnter, handleBackspaceWhenEmpty };
}
