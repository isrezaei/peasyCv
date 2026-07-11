"use client";

import { chakra } from "@chakra-ui/react";
import { memo, useCallback, type CSSProperties } from "react";
import { useDeferredCommit } from "@/hooks/resume/useDeferredCommit";
import { RichTextField } from "./RichTextField";

/**
 * Resume typography is expressed in em so a single font-size value on the page
 * content root scales every field proportionally (the FONT SIZE slider).
 */
export const SIZE_EM: Record<string, string> = {
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
  /** Horizontal alignment of the single-line field (e.g. the centered template). */
  textAlign?: CSSProperties["textAlign"];
  /**
   * Size the single-line field to its content (intrinsic width) instead of filling
   * its container — short text yields a short field, longer text a longer one. Used
   * by the skill chips so each chip hugs its skill name.
   */
  autoWidth?: boolean;
}

type FieldProps = Omit<EditableTextProps, "multiline">;

// Shared chrome: the field reads as plain resume text, inherits the surrounding
// typography exactly, and never overflows its flex container. Inputs are kept
// fully transparent in EVERY state — no hover or focus background fill anywhere.
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
  // Placeholder colour follows the surface: a tinted/dark column sets --rz-placeholder
  // to a readable value; everywhere else it falls back to the default subtle grey.
  _placeholder: { color: "var(--rz-placeholder, var(--chakra-colors-fg-subtle))", fontWeight: "normal" },
  _hover: { bg: "transparent" },
  _focus: { bg: "transparent" },
} as const;

const SingleLineField = memo(function SingleLineField({
  value,
  onChange,
  placeholder,
  fontSize = "sm",
  fontWeight = "normal",
  color,
  textTransform,
  textAlign,
  autoWidth,
}: FieldProps) {
  // Keystrokes stay local and responsive; the global store commit is deferred
  // (debounced + flushed on blur) so typing never triggers a per-character store
  // update + pagination recompute.
  const { value: liveValue, setValue, flush } = useDeferredCommit(value, onChange);
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value),
    [setValue],
  );

  const input = (
    <chakra.input
      {...baseFieldProps}
      {...(autoWidth ? { position: "absolute", insetInlineStart: "0", top: "0", height: "100%" } : null)}
      value={liveValue}
      onChange={handleChange}
      onBlur={flush}
      placeholder={placeholder}
      fontSize={toEm(fontSize)}
      fontWeight={fontWeight}
      color={color}
      textTransform={textTransform}
      textAlign={textAlign}
    />
  );

  if (!autoWidth) return input;

  // Auto-width: an in-flow hidden sizer mirrors the live text (or the placeholder
  // while empty) in the SAME typography and sets the wrapper width; the input is
  // overlaid absolutely so it never contributes its (large) default intrinsic
  // width. The field therefore grows and shrinks to exactly fit its content.
  return (
    <chakra.span position="relative" display="inline-block" maxWidth="100%" minWidth="1ch">
      <chakra.span
        aria-hidden="true"
        display="block"
        visibility="hidden"
        whiteSpace="pre"
        fontFamily="inherit"
        fontSize={toEm(fontSize)}
        fontWeight={fontWeight}
        textTransform={textTransform}
      >
        {liveValue || placeholder || " "}
      </chakra.span>
      {input}
    </chakra.span>
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
