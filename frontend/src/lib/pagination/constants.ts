import type { MonthFormat } from "@/types";

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
 * wastefully padded (0.4 → 6.4mm at the default 16mm margin; was 0.5/8mm). Shared
 * by the column templates AND the column-width model in `useColumnLayout` so the
 * rendered inset and the paginated width stay in lockstep.
 */
export const SIDE_COLUMN_PAD_FACTOR = 0.4;

/** CSS pixels per millimetre at 96dpi (the reference used for screen + print). */
export const PX_PER_MM = 96 / 25.4;

/**
 * Inset (mm) of the "modern" column style's coloured column from the A4 edges —
 * the Chakra space token "6" (24px ≈ 6.35mm), the SAME spacing step
 * double-column's inter-column gap already uses. The column keeps its inner
 * boundary (the main column is untouched) and pulls its outer edge and its
 * top/bottom in by this amount, so the modern column's usable content width
 * shrinks by exactly this value. Shared by the column templates (the rendered
 * box) AND `useColumnLayout`'s width model, so paint and reserve can never
 * diverge. Vertically it is margin traded for padding (the content still
 * starts at the fixed 16mm page margin), so the usable height is unchanged.
 */
export const MODERN_COLUMN_INSET_MM = 24 / PX_PER_MM;

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

/**
 * Maximum column count of the Languages grid — the count the full single-column
 * content width paints (the section's historical fixed-3 look). The grid is
 * width-adaptive now (see {@link languageGridColumns}): a column template's
 * narrower flow drops to 2-up or stacked so cells can never spill out of the
 * section box, exactly like the Key-Achievements grid.
 */
export const LANGUAGE_GRID_COLUMNS = 3;

/**
 * Minimum width (mm) of one Languages grid cell. Chosen so the full-width flow
 * keeps its 3-up look across the whole page-margin slider (content 162–194mm →
 * always 3 tracks) while a column template's narrow flow drops to 2-up
 * (≥ ~99mm) or stacked. Single source of truth consumed by BOTH the CSS
 * auto-fill grid and {@link languageGridColumns}, the achievements pattern.
 */
export const LANGUAGE_CELL_MIN_MM = 46;

/**
 * Fixed column gap (mm) between two Languages grid cells — the exact mm value
 * of the Chakra `columnGap="7"` (28px) the grid has always painted with, so
 * the adaptive grid keeps the identical gap.
 */
export const LANGUAGE_GRID_GAP_MM = 28 / PX_PER_MM;

/**
 * Fixed height (px) of one bar of the "bars" meter variant — deliberately
 * taller than the compact box the other beside-text variants use. Structural
 * chrome (does not scale with the font sliders), so the meter — not the
 * text — can be a cell's tallest element; the row estimator takes the max of
 * both using this SAME constant the meter renders with.
 */
export const LANGUAGE_BAR_HEIGHT_PX = 24;

/**
 * Fixed box size (px) of the compact beside-text meter variants: the dot
 * diameter and the pill track height (its width is 5× this). Shared by the
 * meter renderer and the language-row estimator like
 * {@link LANGUAGE_BAR_HEIGHT_PX}, so paint and reserve can never diverge.
 */
export const LANGUAGE_METER_BOX_PX = 14;

/**
 * Fixed thickness (px) of the "line" meter variant's full-width track, which
 * stacks UNDER the text instead of sitting beside it. Structural chrome like
 * {@link LANGUAGE_BAR_HEIGHT_PX}, shared by the meter renderer and the
 * language-row estimator so the painted track and the reserved height can
 * never diverge. Proven against the live DOM with the row-height probe.
 */
export const LANGUAGE_LINE_TRACK_PX = 6;

/** Fixed gap (px) between the text line and the stacked "line" track (mt=1). */
export const LANGUAGE_LINE_GAP_PX = 4;

/**
 * Minimum width (mm) of one Key-Achievements grid cell. The grid is 2-up only
 * where two cells of at least this width fit (the full single-column content
 * width); anywhere narrower — a column template's main or side column — the
 * items stack one per row. Single source of truth consumed by BOTH the CSS
 * grid (`repeat(auto-fill, minmax(min(80mm, 100%), 1fr))`) and
 * {@link achievementGridColumns}, so the painted and the packed column count
 * derive from the same mm threshold.
 */
export const ACHIEVEMENT_CELL_MIN_MM = 80;

/** Fixed column gap (mm) between two Key-Achievements grid cells. */
export const ACHIEVEMENT_GRID_GAP_MM = 6;

/**
 * Fixed box size (px) of the item's diamond icon. Structural chrome (does not
 * scale with the font sliders) like {@link LANGUAGE_METER_BOX_PX} — shared by
 * the icon renderer and the item-height estimator so paint and reserve can
 * never diverge. Verified against the live DOM with the row-height probe.
 */
export const ACHIEVEMENT_ICON_BOX_PX = 18;

/**
 * Fixed inline space (px) the icon column takes from the cell's text width:
 * the icon box plus the HStack gap="2" (8px) beside it. Read by the estimator
 * to turn the cell width into the text stack's real wrap width.
 */
export const ACHIEVEMENT_ICON_COL_PX = ACHIEVEMENT_ICON_BOX_PX + 8;

/**
 * Fixed vertical cell chrome (px) of one Key-Achievements item: the measured
 * title→description VStack gap (2px) + the cell's pb=1.5 (6px) — 8px exactly
 * against the live DOM (cellH − Σ editor heights = 8.00 on the row-max cells) —
 * plus the same 4px safety sliver the languages cell chrome carries, so the
 * estimate is biased slightly high, never under.
 */
export const ACHIEVEMENT_CELL_PAD_PX = 12;

/**
 * Column count of a `repeat(auto-fill, minmax(min(CELL_MIN, 100%), 1fr))` grid
 * at a given content width — the mm mirror of what Chrome paints (it fits
 * `floor((W + gap) / (min + gap))` tracks, capped by the grid's full-width
 * count). The 1mm epsilon biases the estimate toward FEWER columns at the
 * exact boundary, so a rounding disagreement can only over-reserve (break a
 * touch early), never overflow. Shared by every width-adaptive section grid.
 */
function autoFillGridColumns(
  contentWidthMm: number,
  cellMinMm: number,
  gapMm: number,
  maxColumns: number,
): number {
  return Math.max(
    1,
    Math.min(maxColumns, Math.floor((contentWidthMm - 1 + gapMm) / (cellMinMm + gapMm))),
  );
}

/** Key-Achievements column count at a content width (2-up at full width). */
export function achievementGridColumns(contentWidthMm: number): number {
  return autoFillGridColumns(
    contentWidthMm,
    ACHIEVEMENT_CELL_MIN_MM,
    ACHIEVEMENT_GRID_GAP_MM,
    2,
  );
}

/** Languages column count at a content width (3-up at full width). */
export function languageGridColumns(contentWidthMm: number): number {
  return autoFillGridColumns(
    contentWidthMm,
    LANGUAGE_CELL_MIN_MM,
    LANGUAGE_GRID_GAP_MM,
    LANGUAGE_GRID_COLUMNS,
  );
}

/** Height in px of the small (2xs) inline control buttons that show on screen. */
export const CONTROL_BUTTON_PX = 22;

/**
 * Fixed width (mm) of the Experience/Education date column, per period-date
 * display mode. The column follows the LENGTH CLASS of its date text — the full
 * month name needs the historical 25mm, the numeric month and the bare year
 * progressively less — but stays uniform within a section (one shared mode) so
 * the timeline rails of consecutive entries align. Single source of truth
 * consumed by BOTH the entry blocks (the rendered `width`) and the entry-height
 * estimators (the main column's wrap width), like {@link LANGUAGE_BAR_HEIGHT_PX},
 * so paint and reserve can never diverge.
 */
export const DATE_COLUMN_MONTH_NAME_MM = 25;
export const DATE_COLUMN_MONTH_NUMBER_MM = 18;
export const DATE_COLUMN_YEAR_MM = 16;

/** The one mapping from a section's period-date settings to its date-column width. */
export function periodDateColumnMm(showMonth: boolean, monthFormat: MonthFormat): number {
  if (!showMonth) return DATE_COLUMN_YEAR_MM;
  return monthFormat === "number" ? DATE_COLUMN_MONTH_NUMBER_MM : DATE_COLUMN_MONTH_NAME_MM;
}

/**
 * Fixed horizontal chrome (px) between an entry's date column and its main
 * column: the two `gap="3"` (12px) HStack gaps flanking the timeline rail plus
 * the rail's own 9px width and `mx="1"` (2 × 4px) margins — 12+12+9+8. Read by
 * the entry estimators to turn the date-column width into the main column's
 * real wrap width.
 */
export const TIMELINE_CHROME_PX = 41;

/**
 * Bottom-of-page safety buffer (mm) subtracted from the usable height so that
 * accumulated estimation error never pushes the last block past the A4 frame.
 * Kept to a thin sliver: the per-block estimates are now calibrated to the real
 * /print heights and already biased slightly high, so a large buffer would just
 * leave the bottom of every page empty.
 */
export const PAGE_SAFETY_MM = 4;
