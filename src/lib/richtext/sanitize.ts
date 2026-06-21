/**
 * Pure, DOM-free helpers for the inline rich-text fields (bold / italic /
 * underline applied via the formatting popover — see useInlineFormatting).
 *
 * The resume data model stores these fields as HTML strings (exactly like the
 * pre-existing `summary.html` contract), so persistence, the API payload and the
 * Puppeteer print path are unchanged — the value is still a `string`. To keep
 * that string backend-friendly and XSS-safe, every value the editor produces is
 * passed through `sanitizeRichText` before it reaches the store: only a small
 * whitelist of presentational tags survives and all attributes are dropped, so
 * no event handlers, scripts or styles can ever be persisted or re-rendered.
 *
 * These helpers are intentionally regex-based (no `document`) so they run in the
 * store, in the synchronous pagination model and during server rendering alike.
 */

// Inline marks the popover can toggle, plus the block/line tags a contentEditable
// emits for paragraphs and line breaks. `<b>`/`<i>` are normalized to their
// semantic equivalents so the stored markup is stable regardless of browser.
const ALLOWED_TAGS = new Set(["strong", "em", "u", "br", "p", "div", "ul", "ol", "li"]);
const TAG_ALIASES: Record<string, string> = { b: "strong", i: "em" };

const SCRIPT_LIKE = /<(script|style)[\s\S]*?<\/\1>/gi;
const ANY_TAG = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
const BLOCK_CLOSE = /<\/(p|div|li|h[1-6])>/gi;
const LINE_BREAK = /<br\s*\/?>/gi;
const REMAINING_TAGS = /<[^>]+>/g;

/**
 * Reduces editor HTML to a safe, normalized subset: whitelisted tags only, no
 * attributes, `<b>`→`<strong>` and `<i>`→`<em>`. Unknown tags are unwrapped
 * (their text content is kept); script/style blocks are removed wholesale.
 */
export function sanitizeRichText(html: string): string {
  if (!html) return "";

  const withoutScripts = html.replace(SCRIPT_LIKE, "");

  const cleaned = withoutScripts.replace(ANY_TAG, (match, rawName: string) => {
    const name = rawName.toLowerCase();
    const tag = TAG_ALIASES[name] ?? name;
    if (!ALLOWED_TAGS.has(tag)) return ""; // unwrap: drop the tag, keep its text
    if (tag === "br") return "<br>";
    return match[1] === "/" ? `</${tag}>` : `<${tag}>`;
  });

  // An emptied contentEditable often leaves a stray <br>/<p></p>; collapse those
  // to "" so callers and the `:empty` placeholder treat the field as empty.
  return richTextToPlainText(cleaned).length === 0 ? "" : cleaned;
}

/**
 * Strips all markup to readable text, mapping block boundaries and `<br>` to
 * newlines. Used for emptiness checks and any plain-text consumer.
 */
export function richTextToPlainText(html: string): string {
  if (!html) return "";
  return html
    .replace(BLOCK_CLOSE, "\n")
    .replace(LINE_BREAK, "\n")
    .replace(REMAINING_TAGS, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Prepares a stored value for injection into the contentEditable surface. Values
 * already containing markup are sanitized; legacy plain-text values (saved before
 * these fields became rich) are escaped and have their newlines turned into
 * `<br>` so older résumés keep their line breaks.
 */
export function toEditableHtml(value: string): string {
  if (!value) return "";
  if (/<[a-z!/][\s\S]*>/i.test(value)) return sanitizeRichText(value);
  return escapeHtml(value).replace(/\r?\n/g, "<br>");
}
