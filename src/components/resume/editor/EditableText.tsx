"use client";

import { chakra } from "@chakra-ui/react";
import { memo, useCallback, type CSSProperties } from "react";
import { useDeferredCommit } from "@/hooks/resume/useDeferredCommit";
import { RichTextField } from "./RichTextField";

/**
 * Resume typography is expressed in em so a single font-size value on the page
 * content root scales every field proportionally (the FONT SIZE slider).
 */
const SIZE_EM: Record<string, string> = {
  "2xl": "1.85em",
  xl: "1.4em",
  lg: "1.16em",
  md: "1.04em",
  sm: "0.92em",
  xs: "0.8em",
  "2xs": "0.7em",
};

function toEm(size: string): string {
  return SIZE_EM[size] ?? size;
}

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  textTransform?: CSSProperties["textTransform"];
}

type FieldProps = Omit<EditableTextProps, "multiline">;

// Shared chrome: the field reads as plain resume text, inherits the surrounding
// typography exactly, and never overflows its flex container.
const baseFieldProps = {
  width: "100%",
  minWidth: "0",
  border: "none",
  outline: "none",
  bg: "transparent",
  padding: "0",
  margin: "0",
  resize: "none",
  fontFamily: "inherit",
  lineHeight: "inherit",
  transition: "background 0.12s, box-shadow 0.12s",
  _placeholder: { color: "fg.subtle", fontWeight: "normal" },
  _hover: { bg: "bg.muted/50" },
  _focus: { bg: "bg.muted/50" },
} as const;

const SingleLineField = memo(function SingleLineField({
  value,
  onChange,
  placeholder,
  fontSize = "sm",
  fontWeight = "normal",
  color,
  textTransform,
}: FieldProps) {
  // Keystrokes stay local and responsive; the global store commit is deferred
  // (debounced + flushed on blur) so typing never triggers a per-character store
  // update + pagination recompute.
  const { value: liveValue, setValue, flush } = useDeferredCommit(value, onChange);
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value),
    [setValue],
  );

  return (
    <chakra.input
      {...baseFieldProps}
      value={liveValue}
      onChange={handleChange}
      onBlur={flush}
      placeholder={placeholder}
      fontSize={toEm(fontSize)}
      fontWeight={fontWeight}
      color={color}
      textTransform={textTransform}
    />
  );
});

const MultilineField = memo(function MultilineField({
  value,
  onChange,
  placeholder,
  fontSize = "sm",
  fontWeight = "normal",
  color,
}: FieldProps) {
  // Multiline prose is the natural home for inline formatting, so it edits in a
  // shared rich-text surface: it auto-grows to fit its content (a contentEditable
  // div, not a scrolling textarea) and exposes the bold/italic/underline popover
  // on double-click/selection. The stored value stays a string (now HTML).
  return (
    <RichTextField
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      fontSize={toEm(fontSize)}
      fontWeight={fontWeight}
      color={color}
    />
  );
});

/**
 * Inline field that reads as plain resume text but edits in place. Single-line
 * fields use a plain <input>; multiline fields use the shared RichTextField so
 * prose can be formatted (bold/italic/underline) via the selection popover.
 */
export const EditableText = memo(function EditableText({
  multiline = false,
  ...field
}: EditableTextProps) {
  return multiline ? <MultilineField {...field} /> : <SingleLineField {...field} />;
});
