"use client";

import { chakra } from "@chakra-ui/react";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { useDeferredCommit } from "@/hooks/resume/useDeferredCommit";
import { useInlineFormatting } from "@/hooks/resume/useInlineFormatting";
import { focusEditableEnd, isEditableEmpty } from "@/lib/richtext/caret";
import { sanitizeRichText, toEditableHtml } from "@/lib/richtext/sanitize";
import { FormattingPopover } from "./FormattingPopover";

/** Imperative handle so a list owner can move the caret into a field (e.g. after
 *  a Backspace-delete moves focus to the previous line). */
export interface RichTextHandle {
  focusEnd: () => void;
}

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
  /**
   * Called when Backspace is pressed while the field is already empty. Lets a list
   * owner (the responsibility bullets) delete the line and move focus up, the way
   * a Notion-style list editor behaves.
   */
  onBackspaceWhenEmpty?: () => void;
  /**
   * Called when plain Enter is pressed (Shift+Enter still inserts a line break).
   * Lets a list owner add the next item instead of a newline; when omitted, Enter
   * behaves normally (prose fields like the summary keep their line breaks).
   */
  onEnter?: () => void;
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
 * or typing never resets the caret. Edits commit to the store deferred (debounced
 * + flushed on blur/unmount via useDeferredCommit), so the contentEditable itself
 * is the live "local state". Every emitted value is sanitized, so the store only
 * ever holds the safe tag subset.
 */
export const RichTextField = memo(
  forwardRef<RichTextHandle, RichTextFieldProps>(function RichTextField(
    {
      value,
      onChange,
      placeholder,
      fontSize = "inherit",
      fontWeight,
      color,
      dir,
      textAlign,
      onBackspaceWhenEmpty,
      onEnter,
    },
    ref,
  ) {
    const el = useRef<HTMLDivElement | null>(null);

    // Defer store commits until the user pauses or leaves the field.
    const { value: liveValue, setValue, flush } = useDeferredCommit(value, onChange);

    const emitChange = useCallback(() => {
      const node = el.current;
      if (!node) return;
      const next = sanitizeRichText(node.innerHTML);
      // Restore a truly empty node so the `:empty` placeholder reappears once the
      // user clears the field (browsers tend to leave a stray <br> behind).
      if (next === "" && node.innerHTML !== "") node.innerHTML = "";
      setValue(next);
    }, [setValue]);

    const { popover, apply, handleSelect, close } = useInlineFormatting(el, emitChange);

    // Sync external value → DOM only while unfocused, so live edits keep their caret.
    useEffect(() => {
      const node = el.current;
      if (!node || node === document.activeElement) return;
      const html = toEditableHtml(liveValue);
      if (node.innerHTML !== html) node.innerHTML = html;
    }, [liveValue]);

    useImperativeHandle(ref, () => ({ focusEnd: () => focusEditableEnd(el.current) }), []);

    const handleBlur = useCallback(() => {
      close();
      flush();
    }, [close, flush]);

    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        // Never hijack keys mid-IME-composition.
        if (event.nativeEvent.isComposing) return;
        if (
          event.key === "Backspace" &&
          onBackspaceWhenEmpty &&
          isEditableEmpty(el.current)
        ) {
          event.preventDefault();
          onBackspaceWhenEmpty();
          return;
        }
        // Plain Enter splits the list into a new item; Shift+Enter keeps a line break.
        if (event.key === "Enter" && !event.shiftKey && onEnter) {
          event.preventDefault();
          onEnter();
        }
      },
      [onBackspaceWhenEmpty, onEnter],
    );

    return (
      <>
        <chakra.div
          {...baseFieldProps}
          ref={el}
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
          onKeyDown={handleKeyDown}
          onMouseUp={handleSelect}
          onKeyUp={handleSelect}
          onDoubleClick={handleSelect}
          onBlur={handleBlur}
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
  }),
);
