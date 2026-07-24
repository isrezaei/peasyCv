const BLOCK_SPLIT_PATTERN = /<\/(?:p|li|div|h[1-6])>|<br\s*\/?>/gi;
const TAG_PATTERN = /<[^>]+>/g;

/**
 * Estimates rendered line count for TipTap-produced HTML without measuring the DOM,
 * so pagination can run synchronously on every keystroke without layout thrash.
 *
 * The split pattern's groups are NON-capturing on purpose: `String.split` with a
 * capturing group interleaves the captured tag names ("p", "li", …) into the
 * result, and each one used to count as a phantom 1-line segment — every
 * `<p>`-wrapped field was priced a full line too tall, which is what made items
 * near the bottom of a page look too tall to fit and jump whole to the next page.
 *
 * An INTERIOR empty segment (an empty `<p></p>` between paragraphs) paints a
 * blank line and still counts; only the residue after the final closing tag is
 * dropped, since nothing paints after it.
 */
export function estimateHtmlLines(html: string, charsPerLine: number): number {
  if (!html || !html.trim()) return 0;

  const segments = html
    .split(BLOCK_SPLIT_PATTERN)
    .map((segment) => segment.replace(TAG_PATTERN, "").trim());
  if (segments.length > 1 && segments[segments.length - 1] === "") segments.pop();

  return segments.reduce((total, segment) => {
    return total + Math.max(1, Math.ceil(segment.length / charsPerLine));
  }, 0);
}
