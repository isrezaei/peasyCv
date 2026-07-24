"use client";

import { chakra } from "@chakra-ui/react";
import {
  memo,
  useCallback,
  useImperativeHandle,
  useRef,
  type CSSProperties,
  type Ref,
} from "react";
import { useDeferredCommit } from "@/hooks/resume/useDeferredCommit";
import { useEmptyHighlightActive } from "./EmptyHighlightContext";
import { usePrintText } from "./PrintTextContext";
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

/** Imperative handle so a list owner can move the caret into a field (the
 *  single-line mirror of {@link RichTextHandle} on RichTextField). */
export interface EditableTextHandle {
  focusEnd: () => void;
}

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  /** Caret handle for list owners — single-line fields only (multiline fields
   *  already expose this through RichTextField's own ref). */
  handleRef?: Ref<EditableTextHandle>;
  /**
   * Called when plain Enter is pressed in a single-line field. Lets a list owner
   * add the next item (the Notion-style list behavior shared with RichTextField);
   * when omitted, Enter keeps its native no-op.
   */
  onEnter?: () => void;
  /**
   * Called when Backspace is pressed while the single-line field is empty, so a
   * list owner can delete the line and move focus up — exactly RichTextField's
   * contract, minus the rich-text surface.
   */
  onBackspaceWhenEmpty?: () => void;
  fontSize?: string;
  fontWeight?: string;
  /**
   * Explicit tracking. It CANNOT be inherited from a wrapper: the UA stylesheet
   * resets letter-spacing on form controls, so a template that pins a design's
   * tracking has to set it on the field itself (the same reason baseFieldProps
   * pins `lineHeight: inherit`). Applied to the print text node too, so the
   * editor and the PDF track identically.
   */
  letterSpacing?: string;
  color?: string;
  textTransform?: CSSProperties["textTransform"];
  /** Horizontal alignment of the single-line field (e.g. the centered template). */
  textAlign?: CSSProperties["textAlign"];
  /**
   * Explicit bidi direction for the field's own text run, isolated from the RTL
   * page: "ltr" keeps a raw URL reading from its scheme, "auto" lets an LTR
   * token like `C++` resolve its own base direction instead of inheriting RTL
   * (which renders it `++C`). Unset inherits the surrounding direction.
   */
  dir?: "ltr" | "rtl" | "auto";
  /**
   * Keep the field to ONE visual line that end-ellipsizes when it overflows its
   * container — never a hard clip of the leading characters, and on the print
   * surface never a wrap (the editor's single-line input can't wrap either, so
   * this keeps the two surfaces the same height).
   */
  truncateEnd?: boolean;
  /**
   * Size the single-line field to its content (intrinsic width) instead of filling
   * its container — short text yields a short field, longer text a longer one. Used
   * by the skill chips so each chip hugs its skill name.
   */
  autoWidth?: boolean;
  /**
   * End-ellipsize the EDITOR INPUT only, leaving the print surface to WRAP as
   * before. For narrow-column fields (the timeline-panel's tinted panel) whose
   * print text wraps to several lines — where `truncateEnd` would truncate the
   * PDF — but whose on-screen input would otherwise hard-clip mid-character.
   * No layout or height change on either surface; unset changes nothing.
   */
  inputEllipsis?: boolean;
  /**
   * Opt this field into download-time empty-field validation: when a blocked
   * download turns the highlights on (EmptyHighlightContext) and the field is
   * still blank, its placeholder gets the soft-red marker. Purely an editor
   * affordance — the print/share surfaces never provide the context, so it can
   * never reach a PDF. Set only for "enabled but empty would silently vanish"
   * fields (see hasEmptyRequiredFields).
   */
  validate?: boolean;
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

/**
 * Empty-required-field marker: the PLACEHOLDER TEXT itself turns the literal
 * validation red (#fb5858 — an explicit spec colour, not a token shade). No
 * background band, no border, no padding — a colour-only change, so it can never
 * shift layout or the pagination estimate. `data-empty-highlight` tags the field
 * for scroll-into-view.
 */
export const EMPTY_HIGHLIGHT_COLOR = "#fb5858";

const EMPTY_HIGHLIGHT_INPUT_PROPS = {
  _placeholder: { color: EMPTY_HIGHLIGHT_COLOR, fontWeight: "normal" },
  "data-empty-highlight": "true",
} as const;

const SingleLineField = memo(function SingleLineField({
  value,
  onChange,
  placeholder,
  handleRef,
  onEnter,
  onBackspaceWhenEmpty,
  fontSize = "sm",
  fontWeight = "normal",
  letterSpacing,
  color,
  textTransform,
  textAlign,
  dir,
  truncateEnd,
  autoWidth,
  inputEllipsis,
  validate,
}: FieldProps) {
  // Keystrokes stay local and responsive; the global store commit is deferred
  // (debounced + flushed on blur) so typing never triggers a per-character store
  // update + pagination recompute.
  const { value: liveValue, setValue, flush } = useDeferredCommit(value, onChange);
  // Empty-field validation marker: only when this field opted in (`validate`), a
  // blocked download turned the highlights on, and the live value is still blank.
  // Reading the LIVE (deferred) value means the marker clears the instant the
  // user types, before the store even commits.
  const highlightActive = useEmptyHighlightActive();
  const showEmptyHighlight = Boolean(validate) && highlightActive && liveValue.trim() === "";
  const handleChange = useCallback(
    // A multiline paste into an <input> flattens \n to spaces but keeps raw \t —
    // normalize tabs to a space too so no control character reaches the store.
    (event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value.replace(/\t+/g, " ")),
    [setValue],
  );

  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(
    handleRef,
    () => ({
      focusEnd: () => {
        const node = inputRef.current;
        if (!node) return;
        node.focus();
        node.setSelectionRange(node.value.length, node.value.length);
      },
    }),
    [],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.nativeEvent.isComposing) return;
      // Same list contract as RichTextField: Backspace on an EMPTY line hands the
      // deletion to the list owner; plain Enter hands over adding the next item.
      if (event.key === "Backspace" && onBackspaceWhenEmpty && liveValue === "") {
        event.preventDefault();
        onBackspaceWhenEmpty();
        return;
      }
      if (event.key === "Enter" && onEnter) {
        event.preventDefault();
        onEnter();
      }
    },
    [liveValue, onBackspaceWhenEmpty, onEnter],
  );

  // Print/ATS surface: emit the value as a real text node (never an <input>) so
  // the exported PDF carries extractable text. An empty field renders nothing —
  // placeholders are editor-only affordances and must never leak into the résumé.
  const plainText = usePrintText();
  if (plainText) {
    // A truncating field prints as ONE nowrap line with an end ellipsis (the same
    // single line the editor's input paints), clamped to its container so a long
    // run can never bleed past the page frame.
    return (
      <chakra.span
        display={autoWidth && !truncateEnd ? "inline" : truncateEnd ? "inline-block" : "block"}
        width={autoWidth ? undefined : "100%"}
        maxWidth="100%"
        whiteSpace={truncateEnd ? "nowrap" : "pre-wrap"}
        wordBreak={truncateEnd ? undefined : "break-word"}
        overflow={truncateEnd ? "hidden" : undefined}
        textOverflow={truncateEnd ? "ellipsis" : undefined}
        verticalAlign={truncateEnd ? "bottom" : undefined}
        dir={dir}
        fontFamily="inherit"
        lineHeight="inherit"
        fontSize={toEm(fontSize)}
        fontWeight={fontWeight}
        letterSpacing={letterSpacing}
        color={color}
        textTransform={textTransform}
        textAlign={textAlign}
      >
        {liveValue}
      </chakra.span>
    );
  }

  const input = (
    <chakra.input
      {...baseFieldProps}
      {...(showEmptyHighlight ? EMPTY_HIGHLIGHT_INPUT_PROPS : null)}
      {...(autoWidth ? { position: "absolute", insetInlineStart: "0", top: "0", height: "100%" } : null)}
      // End-ellipsis on overflow: with an explicit LTR dir the hidden part is the
      // TAIL of the value, so a URL's `https://` start can never be clipped away.
      // `inputEllipsis` applies the same treatment to the INPUT alone, while the
      // print span (above) keeps wrapping.
      {...(truncateEnd || inputEllipsis
        ? { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }
        : null)}
      dir={dir}
      ref={inputRef}
      value={liveValue}
      onChange={handleChange}
      onBlur={flush}
      onKeyDown={onEnter || onBackspaceWhenEmpty ? handleKeyDown : undefined}
      placeholder={placeholder}
      fontSize={toEm(fontSize)}
      fontWeight={fontWeight}
      letterSpacing={letterSpacing}
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
  // With truncateEnd the wrapper also HIDES its overflow, so an unbreakable
  // token longer than the container can't stretch the layout (or the page)
  // through the sizer's invisible box — the overlaid input ellipsizes instead.
  return (
    <chakra.span
      position="relative"
      display="inline-block"
      maxWidth="100%"
      minWidth="1ch"
      overflow={truncateEnd ? "hidden" : undefined}
    >
      <chakra.span
        aria-hidden="true"
        display="block"
        visibility="hidden"
        whiteSpace="pre"
        fontFamily="inherit"
        fontSize={toEm(fontSize)}
        fontWeight={fontWeight}
        letterSpacing={letterSpacing}
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
  validate,
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
      validate={validate}
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
