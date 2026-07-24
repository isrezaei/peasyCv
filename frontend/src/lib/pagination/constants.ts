import type { ColumnWidthId, MonthFormat } from "@/types";

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

/**
 * Millimetre offset each "Column Layout" width preset applies to a column
 * template's base side-column width. "medium" (0) is the template's original
 * width, so existing résumés render byte-identically. The steps are sized so
 * that even "xlarge" keeps every template's coloured column well narrower than
 * the main column (worst case: timeline-panel 66mm + 16mm = 82mm vs a 128mm
 * main column). Read through {@link resolveSideWidthMm} by both the rendered
 * column and the pagination width model so they stay in lockstep.
 */
export const COLUMN_WIDTH_DELTA_MM: Record<ColumnWidthId, number> = {
  small: -8,
  medium: 0,
  large: 8,
  xlarge: 16,
};

/** Outer side-column width (mm) of a column template at the given width preset. */
export function resolveSideWidthMm(baseMm: number, columnWidth: ColumnWidthId): number {
  return baseMm + (COLUMN_WIDTH_DELTA_MM[columnWidth] ?? 0);
}

/** CSS pixels per millimetre at 96dpi (the reference used for screen + print). */
export const PX_PER_MM = 96 / 25.4;

/**
 * Geometry of the opt-in section-title separator (`theme.showSectionSeparators`):
 * a 1px hairline drawn WITHIN the title→content gap the frame already paints —
 * an absolutely-positioned overlay centred on that corridor (see
 * `SectionSeparator`), so turning it on adds ZERO in-flow height and the
 * content sits in exactly the same place as with it off (the approved E-12
 * spacing in both states). The 10/1/10 values describe the separator's own
 * clearance box, {@link SECTION_SEPARATOR_EXTRA_PX}, whose centre the overlay
 * aligns to the corridor midpoint — landing the line with ~10px of ink air on
 * each side. Because the separator is out of flow, `estimateSectionTitleHeight`
 * carries NO separator term: paint and reserve are identical on and off.
 */
export const SECTION_SEPARATOR_LINE_PX = 1;
export const SECTION_SEPARATOR_GAP_ABOVE_PX = 10;
export const SECTION_SEPARATOR_GAP_BELOW_PX = 10;

/** SectionFrame's fixed title→content gap (its content Box `mt="0.5"` = 2px) —
 *  the content's side of the separator's below-gap. */
export const SECTION_TITLE_CONTENT_GAP_PX = 2;

/**
 * Painted line box (px) of the "•" list marker the responsibilities and skills
 * LIST rows carry beside their text: fontSize "sm" (a rem token — 14px,
 * deliberately not font-scale-tracking) × its own lineHeight 1.5 = 21px, fixed.
 * A row is never shorter than this glyph box (measured 21.0px in the live DOM),
 * so the bullet-row estimators floor on it.
 */
export const LIST_BULLET_LINE_PX = 21;

/**
 * Vertical padding of the section-title row, in em of the page's base font
 * (0.9em = 13.5px at scale 1) — owned by SectionFrame, NOT by the heading
 * element. It replaces the <h2>'s UA-default 0.83em block margins (~13.4px),
 * which previously supplied this rhythm: as FLEX-ITEM margins they entered the
 * title row's centring, so any asymmetric drop (for the separator) pushed the
 * title glyphs off the icon's centre line. The headings now carry
 * `marginBlock=0` and the frame pads the row symmetrically instead, so the
 * icon/title alignment is identical with the separator on or off. The pads are
 * the SAME in both states — the separator overlay centres itself inside the
 * bottom pad + content gap without consuming or changing them.
 */
export const SECTION_TITLE_PAD_EM = 0.9;

/**
 * Minimum painted height (mm) of a titled section while the separators are ON —
 * the stabilizer that keeps the E-12 rhythm consistent: a very short section
 * (e.g. a single-line skills group) would otherwise let the next title crowd
 * upward. Painted by SectionFrame as CSS `min-height` (only on the run that
 * carries the title, so a continuation run is never stretched) and mirrored by
 * `buildSectionBlocks`, which floors the section's summed block heights at the
 * same constant — paint and reserve agree. `min-height` never clips: a taller
 * section simply grows past it.
 */
export const SECTION_MIN_HEIGHT_MM = 20;

/** The separator overlay's own padded box height (px): its two pads + the line.
 *  Used only to centre the out-of-flow overlay on the title→content corridor —
 *  it adds no flow height and appears in no estimate. */
export const SECTION_SEPARATOR_EXTRA_PX =
  SECTION_SEPARATOR_GAP_ABOVE_PX + SECTION_SEPARATOR_LINE_PX + SECTION_SEPARATOR_GAP_BELOW_PX;

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

/**
 * Average painted advance (mm) of ONE body character per px of font-size —
 * measured in the live Chrome DOM from the natural (unwrapped) width of the
 * calibration sentence: 79 chars span 89.98mm at 9.6px, 112.48mm at 12px and
 * 129.35mm at 13.8px — exactly 0.11865 mm/(char·px) at every scale, i.e. glyph
 * width is perfectly linear in the font size. Biased a hair wide (never narrow)
 * so a derived per-line capacity errs toward MORE wrapped lines, not fewer.
 * Together with {@link LINE_WRAP_LOSS_CHARS} this replaces flow-width-linear
 * scaling for the wrap-capacity of entry text: capacity must be priced against
 * the element's REAL rendered width (see `LayoutMetrics.wrapCharsPerLine`),
 * because the fixed date-column/rail chrome eats a far larger share of a narrow
 * column — the old `bodyCharsPerLine × columnWidth/178` model over-stated a
 * 68.97mm bullet column's capacity by ~33% (64 chars vs Chrome's real ~48).
 */
export const CHAR_MM_PER_FONT_PX = 0.119;

/**
 * Characters lost per wrapped line to word-break raggedness (a line breaks at a
 * word boundary, leaving roughly half a word of unused width). Measured against
 * long wrapped runs in the live DOM: effective capacity sat 2–3 chars below the
 * natural-width capacity at BOTH 132.96mm and 68.97mm columns, so the loss is a
 * constant char count, not a width fraction.
 */
export const LINE_WRAP_LOSS_CHARS = 3;

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
 * The COMPACT dot/pill box + bar height the meter shrinks to inside a narrow
 * COLUMN (the timeline-panel design's panel): a full-size 14px dot row eats
 * roughly half a ~38mm panel cell, squeezing the language name to a few
 * characters. The column-stacked cell drops the meter onto its own row at these
 * reduced sizes so the name keeps the full width. Shared by the meter renderer
 * (its `compact` mode) and the stacked branch of the language-row estimator so
 * paint and reserve stay in lockstep.
 */
export const LANGUAGE_METER_BOX_COMPACT_PX = 9;
export const LANGUAGE_BAR_HEIGHT_COMPACT_PX = 15;

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

// ── Reference-pinned STACKED/GRID entry layout (timeline-panel) ──────────────
// Shared paint↔reserve constants of the stacked composition the timeline-panel
// design uses (read verbatim off the imported `Resume.dc.html`): the entry
// title, its one-line «date | company» meta row and the bullet rows, plus the
// projects 2-up sub-grid and the one-line certification row. Consumed ONLY by
// flows that opt in via `LayoutMetrics.stackedEntries` / `projectsGrid` /
// `certInlineMeta` — no other template reaches any of them.
/** Entry title — reference 12.5px / 700 / +0.03em. */
export const STACKED_ENTRY_TITLE_EM = 12.5 / 15;
/** «date | company» meta row — reference 11px. */
export const STACKED_ENTRY_META_EM = 11 / 15;
/** Bullet text — reference 11.5px. */
export const STACKED_BULLET_EM = 11.5 / 15;
/** Bullet list: reference `ul` margin-top 6px and 3px row gap. */
export const STACKED_LIST_TOP_PX = 6;
export const STACKED_BULLET_GAP_PX = 3;
/** Inline space of the stacked bullet marker column — reference `padding-right: 14px`. */
export const STACKED_BULLET_MARKER_COL_PX = 14;
/** Stacked panel education — reference 11px date / 12px degree / 11.5px school. */
export const STACKED_EDU_META_EM = 11 / 15;
export const STACKED_EDU_TITLE_EM = 12 / 15;
export const STACKED_EDU_SUBTITLE_EM = 11.5 / 15;

/** Projects 2-up sub-grid — reference `1fr 1fr` with 26px column / 12px row gap.
 *  The min cell width keeps the reference's 2-up in the design's ~100mm main
 *  column and collapses to stacked anywhere genuinely narrower. */
export const PROJECT_CELL_MIN_MM = 45;
export const PROJECT_GRID_COL_GAP_MM = 26 / PX_PER_MM;
export const PROJECT_GRID_ROW_GAP_MM = 12 / PX_PER_MM;
/** Project cell type — reference 12.5px name / 10.5px link / 11px description. */
export const PROJECT_CELL_TITLE_EM = 12.5 / 15;
export const PROJECT_CELL_LINK_EM = 10.5 / 15;
export const PROJECT_CELL_DESC_EM = 11 / 15;

/** One-line certification row — reference 13px name / 11px «issuer · date». */
export const CERT_INLINE_NAME_EM = 13 / 15;
export const CERT_INLINE_META_EM = 11 / 15;

/** Key-achievements as a PLAIN bullet list (the reference's «دستاوردهای کلیدی»
 *  `<ul>`): 12.5px body-tier rows behind a 15px marker column. */
export const ACHIEVEMENT_BULLET_EM = 12.5 / 15;
export const ACHIEVEMENT_BULLET_MARKER_COL_PX = 15;

/** Projects column count at a content width (2-up at the reference width). */
export function projectGridColumns(contentWidthMm: number): number {
  return autoFillGridColumns(contentWidthMm, PROJECT_CELL_MIN_MM, PROJECT_GRID_COL_GAP_MM, 2);
}

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
 * Inline-end padding (px) of the Experience entry's main column (`pe="6"`) that
 * clears the overlaid gear/trash controls. Part of the fixed chrome between the
 * flow width and the description's REAL wrap width — verified in the live DOM:
 * the description container measures mainColumn − 6.35mm (24px) in both the
 * 178mm and the 114mm flow.
 */
export const EXP_MAIN_END_PAD_PX = 24;

/**
 * Inline space (px) the "•" marker column takes from a responsibility row: the
 * glyph box plus the row's `gap="1.5"` (6px). Measured in the live DOM: the
 * bullet text container sits 2.84mm (10.75px) inside the description width at
 * every scale (the marker is a fixed `sm` rem token, so this does not scale).
 */
export const BULLET_MARKER_COL_PX = 11;

/**
 * Inline space (px) the Education entry's IN-FLOW remove button takes from its
 * main column: the 2xs IconButton (24px) plus the outer HStack's 8px gap.
 * Unlike Experience (absolute overlay + pe), Education's control participates
 * in layout on screen, so the achievements field wraps at mainColumn − 32px —
 * measured 8.47mm in the live DOM at both flow widths. The control is
 * `no-print`, so the PDF renders WIDER text (fewer wraps) — pricing the
 * on-screen width is the safe, taller reserve.
 */
export const EDU_REMOVE_COL_PX = 32;

/** The section heading's own tight line-box factor (`lineHeight="1.15"` on the
 *  h2 — NOT the theme's body line-height). Part of the painted title-row model
 *  shared by SectionTitleBlock and `estimateSectionTitleHeight`. */
export const SECTION_TITLE_TEXT_LINE_HEIGHT = 1.15;

/** The section-title icon chip's box size in em of the page base font
 *  (`boxSize="1.6em"` in SectionTitleIcon) — with icons on, the chip (24px at
 *  scale 1) is taller than the heading's 18.6px line-box and governs the
 *  title row's height. Shared so paint and reserve read the same box. */
export const SECTION_ICON_BOX_EM = 1.6;

/**
 * Bottom-of-page safety buffer (mm) subtracted from the usable height so that
 * accumulated estimation error never pushes the last block past the A4 frame.
 * Kept to a thin sliver: the per-block estimates are now calibrated to the real
 * /print heights and already biased slightly high, so a large buffer would just
 * leave the bottom of every page empty.
 */
export const PAGE_SAFETY_MM = 4;
