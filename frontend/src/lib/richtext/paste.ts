/**
 * Paste normalization for the inline rich-text fields (see RichTextField).
 *
 * Clipboard HTML from Word / Google Docs / web pages arrives wrapped in inline
 * styles (font-family, font-size, letter-spacing…) that would override the
 * resume's typography. This module reduces a pasted fragment to exactly what the
 * user could have produced by typing: plain lines separated by `<br>` plus the
 * three inline marks the formatting popover offers (<strong>/<em>/<u>). Every
 * other tag, attribute and style is dropped, so the pasted text inherits the
 * field's font, size, weight, line-height and letter-spacing untouched.
 *
 * Unlike lib/richtext/sanitize.ts this file is DOM-dependent (DOMParser) — it
 * only ever runs inside a browser paste event, never on the server.
 */

import { escapeHtml, sanitizeRichText } from "./sanitize";

interface Marks {
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

const NO_MARKS: Marks = { bold: false, italic: false, underline: false };

/** Non-content subtrees that must be dropped wholesale, text included. */
const SKIP_TAGS = new Set([
  "script",
  "style",
  "head",
  "meta",
  "link",
  "title",
  "template",
  "noscript",
  "iframe",
  "object",
  "svg",
]);

/** Elements that end the current line — every block becomes its own line, the
 *  same structure typing Enter produces. */
const BLOCK_TAGS = new Set([
  "address",
  "article",
  "aside",
  "blockquote",
  "dd",
  "div",
  "dl",
  "dt",
  "figcaption",
  "figure",
  "footer",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hr",
  "li",
  "main",
  "nav",
  "ol",
  "p",
  "pre",
  "section",
  "table",
  "td",
  "tr",
  "ul",
]);

/**
 * Reads the effective bold/italic/underline for an element, combining its tag
 * semantics with its inline style. The style wins over the tag so Google Docs'
 * infamous `<b style="font-weight:normal">` wrapper does NOT bold the whole
 * paste, and `<span style="font-weight:700">` keeps its intended bold.
 */
function marksFor(el: Element, inherited: Marks): Marks {
  const tag = el.tagName.toLowerCase();
  let { bold, italic, underline } = inherited;

  if (tag === "b" || tag === "strong") bold = true;
  if (tag === "i" || tag === "em") italic = true;
  if (tag === "u" || tag === "ins") underline = true;

  const style = (el as HTMLElement).style;
  if (style) {
    const weight = style.fontWeight;
    if (weight) {
      const numeric = Number.parseInt(weight, 10);
      if (weight === "bold" || weight === "bolder" || numeric >= 600) bold = true;
      else bold = false;
    }
    const fontStyle = style.fontStyle;
    if (fontStyle === "italic" || fontStyle === "oblique") italic = true;
    else if (fontStyle === "normal") italic = false;

    const decoration = style.textDecorationLine || style.textDecoration;
    if (decoration) {
      if (decoration.includes("underline")) underline = true;
      else if (decoration.includes("none")) underline = false;
    }
  }
  return { bold, italic, underline };
}

function wrapMarks(text: string, marks: Marks): string {
  let out = text;
  if (marks.underline) out = `<u>${out}</u>`;
  if (marks.italic) out = `<em>${out}</em>`;
  if (marks.bold) out = `<strong>${out}</strong>`;
  return out;
}

/** Depth-first walk appending inline content to `lines`, starting a fresh line
 *  at every block boundary and `<br>`. */
function walk(node: Node, lines: string[], marks: Marks): void {
  if (node.nodeType === Node.TEXT_NODE) {
    // Collapse formatting whitespace the same way HTML rendering does.
    const text = (node.nodeValue ?? "").replace(/\s+/g, " ");
    if (text === "" || text === " ") {
      if (text === " " && lines[lines.length - 1] !== "")
        lines[lines.length - 1] += " ";
      return;
    }
    lines[lines.length - 1] += wrapMarks(escapeHtml(text), marks);
    return;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return; // comments etc.
  const el = node as Element;
  const tag = el.tagName.toLowerCase();
  if (SKIP_TAGS.has(tag)) return;

  if (tag === "br") {
    lines.push("");
    return;
  }

  const isBlock = BLOCK_TAGS.has(tag);
  if (isBlock && lines[lines.length - 1] !== "") lines.push("");

  const childMarks = marksFor(el, marks);
  for (const child of Array.from(el.childNodes)) walk(child, lines, childMarks);

  if (isBlock && lines[lines.length - 1] !== "") lines.push("");
}

/**
 * Converts clipboard HTML into the editor's normalized subset: text +
 * <strong>/<em>/<u> marks, lines joined by <br>. Returns "" when the fragment
 * carries no text (e.g. an image-only paste) so callers can fall back to the
 * clipboard's text/plain flavor.
 */
export function normalizePastedHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const lines: string[] = [""];
  walk(doc.body, lines, NO_MARKS);

  while (lines.length > 0 && lines[lines.length - 1].trim() === "") lines.pop();
  while (lines.length > 0 && lines[0].trim() === "") lines.shift();

  // The walk already emits whitelisted tags only; the shared sanitizer is kept
  // as the final gate so the paste path can never widen the stored subset.
  return sanitizeRichText(lines.join("<br>"));
}

/** Escapes a text/plain clipboard flavor for insertion, keeping line breaks. */
export function plainTextToHtml(text: string): string {
  if (!text) return "";
  return escapeHtml(text).replace(/\r?\n/g, "<br>");
}
