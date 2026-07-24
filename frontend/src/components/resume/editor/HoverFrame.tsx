"use client";

import type { SystemStyleObject } from "@chakra-ui/react";

/**
 * Light, DOTTED hover outline. Rendered as an `outline` offset out from the
 * content, so it never touches the text and — crucially — never affects layout,
 * pagination or the PDF (outlines are not part of box flow and `:hover` never
 * fires in print). Two offsets: a roomier one for the single header block, and a
 * tighter one for the per-entry item outline.
 */
export const CONTENT_BORDER_HOVER = {
  outlineWidth: "1.5px",
  outlineStyle: "dotted",
  outlineColor: "#d4d4d8", // zinc.300 — light, subtle
  outlineOffset: "10px",
} as const;

/** Per-item hover outline — a tighter offset so each entry frames individually. */
export const ITEM_HOVER_OUTLINE = {
  outlineWidth: "1.5px",
  outlineStyle: "dotted",
  outlineColor: "#d4d4d8",
  outlineOffset: "6px",
} as const;

/**
 * Shared styling for the per-item remove control. It uses the APP chrome colour
 * (gray) — never red — and is revealed only when its own item is hovered (each
 * item is the nearest `.group`). `no-print` keeps it out of the PDF.
 */
export const itemRemoveButtonProps = {
  size: "2xs",
  variant: "ghost",
  colorPalette: "gray",
  borderRadius: "md",
  color: "fg.muted",
  className: "no-print",
  opacity: 0,
  _groupHover: { opacity: 1 },
  _focusVisible: { opacity: 1, bg: "bg.muted", color: "fg" },
  _hover: { bg: "bg.muted", color: "fg" },
} as const;

/**
 * Variant of {@link itemRemoveButtonProps} for a control nested INSIDE a `.group`
 * item (each skill tag/line inside a skills group): identical look, but revealed
 * by the skill's own named `group/skill` wrapper — the enclosing unnamed `.group`
 * would light every skill's control at once.
 */
export const nestedItemRemoveButtonProps = {
  ...itemRemoveButtonProps,
  _groupHover: {},
  css: {
    ".group\\/skill:hover &, .group\\/skill:focus-within &": { opacity: 1 },
  },
} as const;

/**
 * Reveal contract for the section control (the dots HoverFrame). The control rests
 * at low opacity and lifts to full when its OWNING SECTION is hovered (or holds
 * focus). The reveal is driven from the section wrapper — so the entire section is
 * the hover target — via this scoped selector targeting the control's
 * `data-hover-frame` marker. It deliberately does NOT use a `.group`, which would
 * collide with the per-item hover groups nested inside each section.
 */
export const SECTION_HOVER_FRAME_REVEAL: SystemStyleObject = {
  "&:hover [data-hover-frame], &:focus-within [data-hover-frame]": { opacity: 1 },
};
