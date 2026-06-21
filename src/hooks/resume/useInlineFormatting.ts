"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";

/** The inline marks the formatting popover can toggle on a selection. */
export type FormatCommand = "bold" | "italic" | "underline";

export interface InlineFormattingState {
  open: boolean;
  /** Viewport coordinates (px) of the popover anchor — it is rendered fixed. */
  top: number;
  left: number;
  active: Record<FormatCommand, boolean>;
}

const CLOSED: InlineFormattingState = {
  open: false,
  top: 0,
  left: 0,
  active: { bold: false, italic: false, underline: false },
};

/** Gap (px) reserved above the selection so the popover floats clear of the text. */
const ANCHOR_OFFSET = 10;

function readActiveMarks(): Record<FormatCommand, boolean> {
  const state = (command: string) => {
    try {
      return document.queryCommandState(command);
    } catch {
      return false;
    }
  };
  return { bold: state("bold"), italic: state("italic"), underline: state("underline") };
}

/**
 * Shared mechanism powering the double-click / selection formatting popover used
 * by every rich-text field (see RichTextField). It watches the selection inside
 * one editable element and, whenever a non-empty range is selected there, exposes
 * the anchor position and active marks so a small popover can be shown next to the
 * word. `apply` toggles a mark on the live selection and re-reads the field.
 *
 * `execCommand` is used deliberately: it is the one broadly-supported primitive
 * that toggles inline marks on an arbitrary contentEditable selection (including
 * un-formatting and partial overlaps) without shipping a full editor framework.
 */
export function useInlineFormatting(
  editableRef: RefObject<HTMLElement | null>,
  onAfterFormat: () => void,
) {
  const [popover, setPopover] = useState<InlineFormattingState>(CLOSED);

  // The functional updater returns the same reference when already closed, so
  // React bails out — no redundant re-render and no `popover` dependency needed.
  const close = useCallback(() => {
    setPopover((prev) => (prev.open ? CLOSED : prev));
  }, []);

  const evaluateSelection = useCallback(() => {
    const el = editableRef.current;
    const selection = typeof window !== "undefined" ? window.getSelection() : null;
    if (!el || !selection || selection.rangeCount === 0 || selection.isCollapsed) {
      close();
      return;
    }

    const range = selection.getRangeAt(0);
    // Only react to selections that live inside this field.
    if (!el.contains(range.commonAncestorContainer)) {
      close();
      return;
    }

    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      close();
      return;
    }

    setPopover({
      open: true,
      top: rect.top - ANCHOR_OFFSET,
      left: rect.left + rect.width / 2,
      active: readActiveMarks(),
    });
  }, [editableRef, close]);

  const handleSelect = useCallback(() => {
    // Defer a frame so the browser has finalized the selection (notably after a
    // double-click word-select) before we measure its rectangle.
    requestAnimationFrame(evaluateSelection);
  }, [evaluateSelection]);

  const apply = useCallback(
    (command: FormatCommand) => {
      const el = editableRef.current;
      if (!el) return;
      el.focus();
      try {
        // Emit tags (<strong>/<em>/<u>) rather than inline styles so the stored
        // markup matches the sanitizer's whitelist.
        document.execCommand("styleWithCSS", false, "false");
        document.execCommand(command);
      } catch {
        return;
      }
      onAfterFormat();
      // Re-measure: the toggle can shift the selection rectangle and flips marks.
      evaluateSelection();
    },
    [editableRef, onAfterFormat, evaluateSelection],
  );

  // While open, dismiss on outside pointer-downs and on scroll/resize (the anchor
  // is a viewport coordinate, so it would otherwise drift away from the word).
  useEffect(() => {
    if (!popover.open) return;

    const onPointerDown = (event: MouseEvent) => {
      const el = editableRef.current;
      const target = event.target as Node | null;
      if (el && target && el.contains(target)) return; // selecting within the field
      if (target instanceof Element && target.closest("[data-formatting-popover]")) return;
      close();
    };

    window.addEventListener("mousedown", onPointerDown, true);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("mousedown", onPointerDown, true);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [popover.open, editableRef, close]);

  return { popover, apply, handleSelect, close };
}
