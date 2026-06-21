const BLOCK_SPLIT_PATTERN = /<\/(p|li|div|h[1-6])>|<br\s*\/?>/gi;
const TAG_PATTERN = /<[^>]+>/g;

/**
 * Estimates rendered line count for TipTap-produced HTML without measuring the DOM,
 * so pagination can run synchronously on every keystroke without layout thrash.
 */
export function estimateHtmlLines(html: string, charsPerLine: number): number {
  if (!html || !html.trim()) return 0;

  const segments = html
    .split(BLOCK_SPLIT_PATTERN)
    .map((segment) => segment?.replace(TAG_PATTERN, "").trim())
    .filter((segment) => segment?.length > 0);

  if (segments.length === 0) return 0;

  return segments.reduce((total, segment) => {
    return total + Math.max(1, Math.ceil(segment.length / charsPerLine));
  }, 0);
}
