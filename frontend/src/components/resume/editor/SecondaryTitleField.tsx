"use client";

import { memo } from "react";
import { EditableText } from "./EditableText";

interface SecondaryTitleFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** The user's selected RESUME accent (resolved theme accent), not the app chrome color. */
  accentColor: string;
  /** Explicit subtitle colour override (the vivid marker). Unset keeps the
   *  classic source — the `--rz-subtitle` var with `accentColor` as fallback. */
  markerColor?: string;
  fontSize?: string;
  fontWeight?: string;
  /** Explicit tracking (never inherited into the field — see EditableText). */
  letterSpacing?: string;
  /** Opt the underlying field into download-time empty-field validation. */
  validate?: boolean;
  /**
   * Print-surface behavior (default true — the classic one-line end-ellipsis).
   * A narrow-column variant (the timeline panel) passes false so a long value
   * WRAPS on print, while the editor input still end-ellipsizes.
   */
  truncateEnd?: boolean;
}

/**
 * The "secondary title" of any section entry — the job title under the name in
 * Personal Info, the company under a role in Experience, the university under a
 * degree in Education. It paints in the resume's `--rz-subtitle` tier (~two steps
 * lighter than the accent, a step below the primary entry title) so every subtitle
 * reads as one consistent family. The page/column sets that variable;
 * `accentColor` is the fallback for any context that hasn't set it. Renders
 * BOLD by default so the lighter (two-steps) secondary tint stays legible.
 */
export const SecondaryTitleField = memo(function SecondaryTitleField({
  value,
  onChange,
  placeholder,
  accentColor,
  markerColor,
  fontSize = "sm",
  fontWeight = "bold",
  letterSpacing,
  validate,
  truncateEnd = true,
}: SecondaryTitleFieldProps) {
  return (
    <EditableText
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      color={markerColor ?? `var(--rz-subtitle, ${accentColor})`}
      fontSize={fontSize}
      fontWeight={fontWeight}
      letterSpacing={letterSpacing}
      validate={validate}
      // Base direction stays the SECTION's (inherited — Persian sections are
      // RTL, so titles right-align). NEVER dir="auto" here: a Persian title
      // that happens to start with a Latin word or digit would be misdetected
      // as LTR and jump left. End-ellipsized so a long title trails off
      // instead of hard-clipping at the header edge; the wrap-on-print variant
      // keeps the ellipsis on the editor input alone.
      truncateEnd={truncateEnd}
      inputEllipsis={!truncateEnd}
    />
  );
});
