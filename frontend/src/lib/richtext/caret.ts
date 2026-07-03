/**
 * Small caret helpers for the contentEditable rich-text fields. Kept here so the
 * field component stays lean and the DOM/selection details live in one place.
 */

/** True when a contentEditable element holds no text at all (a stray <br> that
 *  browsers leave behind still counts as empty). */
export function isEditableEmpty(el: HTMLElement | null): boolean {
  if (!el) return false;
  return (el.textContent ?? "").length === 0;
}

/** Focus a contentEditable element and place the caret at the very end of its
 *  content — used when a list line is deleted and focus moves up to the previous
 *  line, like a normal list editor. */
export function focusEditableEnd(el: HTMLElement | null): void {
  if (!el) return;
  el.focus();
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false); // collapse to the end boundary
  selection.removeAllRanges();
  selection.addRange(range);
}
