"use client";

import { memo } from "react";
import { EditableText } from "./EditableText";

interface SecondaryTitleFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** The user's selected RESUME accent (resolved theme accent), not the app chrome color. */
  accentColor: string;
  fontSize?: string;
  fontWeight?: string;
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
  fontSize = "sm",
  fontWeight = "bold",
}: SecondaryTitleFieldProps) {
  return (
    <EditableText
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      color={`var(--rz-subtitle, ${accentColor})`}
      fontSize={fontSize}
      fontWeight={fontWeight}
    />
  );
});
