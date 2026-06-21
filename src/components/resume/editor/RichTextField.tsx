"use client";

import { chakra } from "@chakra-ui/react";
import { memo, useCallback, useEffect, useRef, type CSSProperties } from "react";
import { useInlineFormatting } from "@/hooks/resume/useInlineFormatting";
import { sanitizeRichText, toEditableHtml } from "@/lib/richtext/sanitize";
import { FormattingPopover } from "./FormattingPopover";

interface RichTextFieldProps {
  /** Stored HTML for the field (the same backend-friendly string contract). */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** A CSS length (em is preferred so it scales with the font-size slider). */
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  dir?: "rtl" | "ltr";
  textAlign?: CSSProperties["textAlign"];
}

// Reads as plain résumé prose, inherits the surrounding typography, and never
// overflows its flex column. Mirrors EditableText's chrome so a rich field and a
// plain field are visually indistinguishable until the user formats a word.
const baseFieldProps = {
  width: "100%",
  minWidth: "0",
  outline: "none",
  bg: "transparent",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  fontFamily: "inherit",
  lineHeight: "inherit",
  borderRadius: "sm",
  transition: "background 0.12s",
  _hover: { bg: "bg.muted/50" },
  _focus: { bg: "bg.muted/50" },
} as const;

/**
 * Reusable inline rich-text field: a contentEditable surface that supports
 * bold / italic / underline through the shared double-click / selection popover
 * (see useInlineFormatting) and persists the result as whitelisted HTML.
 *
 * The DOM is kept uncontrolled — React never renders children into it; the value
 * is written imperatively only while the field is unfocused — so applying a mark
 * or typing never resets the caret. Every emitted value is sanitized, so the
 * store only ever holds the safe tag subset.
 */
export const RichTextField = memo(function RichTextField({
  value,
  onChange,
  placeholder,
  fontSize = "inherit",
  fontWeight,
  color,
  dir,
  textAlign,
}: RichTextFieldProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const emitChange = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const next = sanitizeRichText(el.innerHTML);
    // Restore a truly empty node so the `:empty` placeholder reappears once the
    // user clears the field (browsers tend to leave a stray <br> behind).
    if (next === "" && el.innerHTML !== "") el.innerHTML = "";
    onChange(next);
  }, [onChange]);

  const { popover, apply, handleSelect, close } = useInlineFormatting(ref, emitChange);

  // Sync external value → DOM only while unfocused, so live edits keep their caret.
  useEffect(() => {
    const el = ref.current;
    if (!el || el === document.activeElement) return;
    const html = toEditableHtml(value);
    if (el.innerHTML !== html) el.innerHTML = html;
  }, [value]);

  return (
    <>
      <chakra.div
        {...baseFieldProps}
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={placeholder}
        data-placeholder={placeholder}
        dir={dir}
        fontSize={fontSize}
        fontWeight={fontWeight}
        color={color}
        textAlign={textAlign}
        onInput={emitChange}
        onMouseUp={handleSelect}
        onKeyUp={handleSelect}
        onDoubleClick={handleSelect}
        onBlur={close}
        css={{
          "&:empty:before": {
            content: "attr(data-placeholder)",
            color: "var(--chakra-colors-fg-subtle)",
            fontWeight: "normal",
            pointerEvents: "none",
          },
          "& strong, & b": { fontWeight: "700" },
          "& em, & i": { fontStyle: "italic" },
          "& u": { textDecoration: "underline" },
          "& p": { margin: 0 },
          "& ul, & ol": { paddingInlineStart: "1.2em", margin: 0 },
        }}
      />
      <FormattingPopover state={popover} onApply={apply} />
    </>
  );
});
