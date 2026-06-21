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
 * degree in Education. It always paints in the user's selected RESUME accent so
 * every section's subtitle reads as one consistent family. Reusing this single
 * component is what keeps that rule in one place; pass the resolved theme accent.
 */
export const SecondaryTitleField = memo(function SecondaryTitleField({
  value,
  onChange,
  placeholder,
  accentColor,
  fontSize = "sm",
  fontWeight = "medium",
}: SecondaryTitleFieldProps) {
  return (
    <EditableText
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      color={accentColor}
      fontSize={fontSize}
      fontWeight={fontWeight}
    />
  );
});
