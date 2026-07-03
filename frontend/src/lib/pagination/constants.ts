export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;

/**
 * THE single source of truth for the page's top & bottom print margin (mm).
 *
 * Every A4 page, in every template, sits its content exactly this far from the
 * top edge AND from the bottom edge — the margins are always equal and always
 * 16mm (the professional A4 sweet spot, ~0.63in). The page frame owns this value
 * (see {@link A4Page} and the column templates' `paddingBlock`), so a section
 * redesign can never change it, and the pagination engine derives its usable
 * height from the SAME constant, so fill/break respects the identical 16mm model.
 * It is deliberately NOT the theme's `pageMargin` slider (which only tunes the
 * horizontal inset): the vertical margin stays locked at 16mm no matter what.
 */
export const PAGE_MARGIN_MM = 16;

/**
 * Inner inline (horizontal) padding of a coloured/narrow side column, expressed as
 * a fraction of the horizontal page margin. Kept tight so the aside panels are not
 * wastefully padded. Shared by the column templates AND the column-width model in
 * `useColumnLayout` so the rendered inset and the paginated width stay in lockstep.
 */
export const SIDE_COLUMN_PAD_FACTOR = 0.5;

/** CSS pixels per millimetre at 96dpi (the reference used for screen + print). */
export const PX_PER_MM = 96 / 25.4;

/** Body font size in px at font scale 1.0; mirrors BASE_FONT_PX in A4Page. */
export const BASE_FONT_PX = 15;

/**
 * Characters per line of summary text (0.92em) at font scale 1.0 across the full
 * content width (A4 minus default 16mm margins, 178mm). Calibrated against the
 * live /print DOM: a 132-char summary wraps to exactly 2 lines at 178mm and 3
 * lines at ~104mm (see scripts measuring rendered line counts), i.e. ~108 chars
 * fit per line — this is set a notch below that true capacity so the line count
 * is biased slightly high (never under-counted) yet tracks reality. Column
 * metrics scale it down by the column's real width.
 */
export const CHARS_PER_LINE_AT_BASE = 105;

/**
 * Characters per line for body text (0.8em — responsibilities, project/achievement
 * descriptions) at the reference content width (178mm), font scale 1.0. Calibrated
 * against the live /print DOM: a 99-char description renders on ONE line at the
 * ~145mm body column and wraps to two lines only below ~90mm. Set a notch below
 * the true single-line capacity (~115–128) so it is biased slightly high, and the
 * column metrics scale it by the column's real width so a narrow side column
 * correctly counts more wrapped lines. Replaces the old, ~3x-too-conservative 32
 * that made every entry estimate tall and broke pages a whole block early.
 */
export const BODY_CHARS_PER_LINE_AT_BASE = 100;

// --- Font sizes (em) used by the resume blocks, mirrored from the components ---
export const EM_NAME = 1.85; // 2xl — full name
export const EM_SUBTITLE = 1.04; // md — job title under the name
export const EM_SECTION_TITLE = 1.08; // section headings
export const EM_ITEM_TITLE = 0.92; // sm — entry titles (job title, degree, project, ...)
export const EM_BODY = 0.8; // xs — dates, descriptions, responsibilities, chips, contacts
export const EM_SUMMARY = 0.92; // summary rich text

/**
 * Minimum line count reserved for a multiline rich-text field. These fields render
 * as grow-to-content TipTap editors (not fixed-height textareas), so a short value
 * occupies a single line — the floor is 1. The old floor of 2 over-counted every
 * one-line description/achievement/responsibility by a full line.
 */
export const MULTILINE_ROWS = 1;

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
 * Kept to a thin sliver: the per-block estimates are now calibrated to the real
 * /print heights and already biased slightly high, so a large buffer would just
 * leave the bottom of every page empty.
 */
export const PAGE_SAFETY_MM = 4;
