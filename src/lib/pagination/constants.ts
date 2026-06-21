export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;

/** CSS pixels per millimetre at 96dpi (the reference used for screen + print). */
export const PX_PER_MM = 96 / 25.4;

/** Body font size in px at font scale 1.0; mirrors BASE_FONT_PX in A4Page. */
export const BASE_FONT_PX = 15;

/**
 * Characters per line of summary text at font scale 1.0 within the content width.
 * Tuned for Vazirmatn Persian glyphs (measured ~40–45 chars/line at 0.92em across
 * the content width — see scripts/measure-pagination.mjs); kept conservative so
 * the summary is never under-counted.
 */
export const CHARS_PER_LINE_AT_BASE = 42;

/**
 * Characters per line for body text that wraps inside a *narrow* entry column
 * (responsibilities, project/achievement descriptions) rather than the full
 * content width. These fields sit to the side of the date column and timeline
 * rail, so they fit fewer characters per line than the full-width summary. Kept
 * deliberately conservative (lower than the measured capacity) so a multiline
 * field is never under-counted now that it auto-grows to fit its content.
 */
export const BODY_CHARS_PER_LINE_AT_BASE = 32;

// --- Font sizes (em) used by the resume blocks, mirrored from the components ---
export const EM_NAME = 1.85; // 2xl — full name
export const EM_SUBTITLE = 1.04; // md — job title under the name
export const EM_SECTION_TITLE = 1.08; // section headings
export const EM_ITEM_TITLE = 0.92; // sm — entry titles (job title, degree, project, ...)
export const EM_BODY = 0.8; // xs — dates, descriptions, responsibilities, chips, contacts
export const EM_SUMMARY = 0.92; // summary rich text

/** A multiline field renders as a fixed two-row textarea (rows=2, no auto-grow). */
export const MULTILINE_ROWS = 2;

/**
 * Fixed gap (mm) rendered between blocks that belong to the same section (the
 * heading and its first entry, and consecutive entries). The section-spacing
 * slider only governs the larger gap *between* sections, so within-section
 * spacing stays tight and uniform regardless of the slider — this is what makes
 * a heading sit close to its content while sections remain clearly separated.
 */
export const WITHIN_SECTION_GAP_MM = 2;

/** Height in px of the small (2xs) inline control buttons that show on screen. */
export const CONTROL_BUTTON_PX = 22;

/**
 * Bottom-of-page safety buffer (mm) subtracted from the usable height so that
 * accumulated estimation error never pushes the last block past the A4 frame.
 */
export const PAGE_SAFETY_MM = 6;
