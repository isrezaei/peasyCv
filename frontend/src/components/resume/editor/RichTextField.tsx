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
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { useDeferredCommit } from "@/hooks/resume/useDeferredCommit";
import { useInlineFormatting } from "@/hooks/resume/useInlineFormatting";
import { focusEditableEnd, isEditableEmpty } from "@/lib/richtext/caret";
import { normalizePastedHtml, plainTextToHtml } from "@/lib/richtext/paste";
import { sanitizeRichText, toEditableHtml } from "@/lib/richtext/sanitize";
import { isBlank } from "@/lib/resume/emptyFields";
import { useEmptyHighlightActive } from "./EmptyHighlightContext";
import { FormattingPopover } from "./FormattingPopover";
import { usePrintText } from "./PrintTextContext";

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
  /**
   * Opt this field into download-time empty-field validation (see EditableText's
   * `validate`). Editor-only marker — never provided on /print or /share.
   */
  validate?: boolean;
}

// Reads as plain résumé prose, inherits the surrounding typography, and never
// overflows its flex column. Mirrors EditableText's chrome so a rich field and a
// plain field are visually indistinguishable until the user formats a word. Like
// every input it stays fully transparent — no hover or focus background fill.
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
  _hover: { bg: "transparent" },
  _focus: { bg: "transparent" },
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
      validate,
    },
    ref,
  ) {
    const el = useRef<HTMLDivElement | null>(null);
    const plainText = usePrintText();

    // Defer store commits until the user pauses or leaves the field.
    const { value: liveValue, setValue, flush } = useDeferredCommit(value, onChange);

    // Empty-field validation marker (editor-only, same contract as EditableText):
    // the placeholder gets the soft-red band while this field opted in, a blocked
    // download turned the highlights on, and the value is still blank.
    const highlightActive = useEmptyHighlightActive();
    const showEmptyHighlight = Boolean(validate) && highlightActive && isBlank(liveValue);

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

    // Normalize pasted content to the editor's own subset (text, line breaks,
    // bold/italic/underline) so it inherits the field's typography exactly like
    // typed text. Without this the browser inserts the clipboard's raw HTML —
    // foreign font-family/size/weight styles included. insertHTML is used for
    // the same reason as useInlineFormatting's execCommand: it edits the live
    // selection (replacing it when non-collapsed) and preserves the undo stack.
    const handlePaste = useCallback(
      (event: ClipboardEvent<HTMLDivElement>) => {
        event.preventDefault();
        const html = event.clipboardData.getData("text/html");
        const insert =
          (html && normalizePastedHtml(html)) ||
          plainTextToHtml(event.clipboardData.getData("text/plain"));
        if (!insert) return;
        try {
          document.execCommand("insertHTML", false, insert);
        } catch {
          return;
        }
        emitChange();
      },
      [emitChange],
    );

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
          // Commit this line's deferred text first, so anything the add action
          // consults (the page-bottom boundary probe reads the store's resume)
          // sees the field's final content, not a debounce-stale value.
          flush();
          onEnter();
        }
      },
      [onBackspaceWhenEmpty, onEnter, flush],
    );

    // Print/ATS surface: render the stored HTML as static text nodes (no
    // contentEditable) so the PDF carries real, extractable prose. Empty prose
    // renders an empty box — the placeholder never prints.
    if (plainText) {
      return (
        <chakra.div
          dir={dir}
          fontFamily="inherit"
          lineHeight="inherit"
          fontSize={fontSize}
          fontWeight={fontWeight}
          color={color}
          textAlign={textAlign}
          css={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            "& strong, & b": { fontWeight: "700" },
            "& em, & i": { fontStyle: "italic" },
            "& u": { textDecoration: "underline" },
            "& p": { margin: 0 },
            "& ul, & ol": { paddingInlineStart: "1.2em", margin: 0 },
          }}
          dangerouslySetInnerHTML={{ __html: toEditableHtml(liveValue) }}
        />
      );
    }

    return (
      <>
        <chakra.div
          {...baseFieldProps}
          {...(showEmptyHighlight ? { "data-empty-highlight": "true" } : null)}
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
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          onMouseUp={handleSelect}
          onKeyUp={handleSelect}
          onDoubleClick={handleSelect}
          onBlur={handleBlur}
          css={{
            "&:empty:before": {
              content: "attr(data-placeholder)",
              // Follows the surface via --rz-placeholder (set on tinted/dark
              // columns); falls back to the default subtle grey elsewhere. When
              // flagged empty, the placeholder text turns the literal spec red.
              color: showEmptyHighlight
                ? "#fb5858"
                : "var(--rz-placeholder, var(--chakra-colors-fg-subtle))",
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
