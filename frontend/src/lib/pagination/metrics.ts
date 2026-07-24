import type { ThemeSettings } from "@/types";
import {
  A4_HEIGHT_MM,
  A4_WIDTH_MM,
  BASE_FONT_PX,
  BODY_CHARS_PER_LINE_AT_BASE,
  CHAR_MM_PER_FONT_PX,
  CHARS_PER_LINE_AT_BASE,
  LINE_WRAP_LOSS_CHARS,
  PAGE_MARGIN_MM,
  PX_PER_MM,
  WITHIN_SECTION_GAP_MM,
} from "./constants";

/**
 * Content width (mm) the single-column chars-per-line constants were calibrated
 * against: the A4 width minus the default 16mm margins. A column narrower than
 * this fits proportionally fewer characters per line (text wraps more), so the
 * column metrics scale the line capacity by `contentWidthMm / this`.
 */
const REFERENCE_CONTENT_WIDTH_MM = A4_WIDTH_MM - 2 * PAGE_MARGIN_MM;

/**
 * Theme-derived measurement model that the pagination engine packs against.
 *
 * Pagination is computed purely from this model (never from the live DOM), so it
 * runs synchronously on every edit and can be replayed identically inside a
 * headless Puppeteer renderer for PDF export. To stay faithful to what the
 * editor actually paints, every height is derived from the same inputs the
 * A4 page uses: the page margin, the font scale, the line height and the
 * inter-block section spacing. Two unit systems coexist on the page and the
 * model honours both:
 *   - Text scales with the font size (em) and line height (the `lineMm` helper).
 *   - Structural chrome (paddings, gaps, control buttons) is fixed px regardless
 *     of font scale, converted to mm via `pxToMm`.
 */
export interface LayoutMetrics {
  /** Printable height of a single page: A4 height minus the top and bottom margins. */
  usableHeightMm: number;
  /** Vertical gap between two sections (the section-spacing slider token). */
  sectionGapMm: number;
  /** Fixed, tight gap between blocks inside the same section. */
  withinGapMm: number;
  /** Height in mm of one line of text rendered at the given em font size. */
  lineMm: (em: number) => number;
  /**
   * Height in mm of one line at an EXPLICIT line-height, for text a template
   * pins away from the theme's line-height slider (see {@link proseLineHeights}).
   * `lineMm(em)` is exactly `lineMmAt(em, theme.lineHeight)`.
   */
  lineMmAt: (em: number, lineHeight: number) => number;
  /** Size in mm of `em` at the scaled base font, WITHOUT the line-height —
   *  for chrome whose painted box is a pure em size (pads, icon chips). */
  emMm: (em: number) => number;
  /**
   * Characters that fit on one wrapped line of an element whose REAL rendered
   * width is `widthMm`, at the given em font size and the active font scale.
   * Derived from the measured per-character advance ({@link CHAR_MM_PER_FONT_PX},
   * linear in font px) minus the constant word-break loss — so the capacity is
   * priced against the element's actual width, never the flow width: the fixed
   * date-column/rail chrome eats a far larger share of a narrow column, which
   * flow-proportional scaling over-credits (the M1/M2 under-reserve family).
   * Floored, so a rounding disagreement can only over-count lines (over-reserve).
   */
  wrapCharsPerLine: (widthMm: number, em: number) => number;
  /** Approximate characters that fit on one line of full-width text (summary) at the current font scale. */
  charsPerLine: number;
  /** Approximate characters per line for body text wrapping inside a narrow entry column. */
  bodyCharsPerLine: number;
  /** Content width (mm) this flow renders at — used to wrap-aware estimate width-sensitive blocks (e.g. skill chips). */
  contentWidthMm: number;
  /**
   * Section-heading font size (em of the page base) this flow PAINTS at, when the
   * template pins it away from the shared {@link EM_SECTION_TITLE}. Unset keeps
   * the shared size, so every template that does not opt in reserves exactly the
   * same title height it always has. A template that paints a bigger heading (the
   * timeline-panel design's 19px main / 14px panel headings) MUST set it, or the
   * reserve would price a smaller row than the page paints.
   */
  sectionTitleEm?: number;
  /**
   * This flow paints its DATED entries stacked (the period as one row above the
   * title) instead of in the fixed {@link periodDateColumnMm} column — the
   * narrow-column composition the timeline-panel design's side panel uses. Unset
   * — every other template — keeps the date-column model unchanged.
   */
  stackedEntries?: boolean;
  /**
   * This flow paints the Projects section as the reference's 2-up sub-grid
   * (see {@link projectGridColumns}) instead of the shared stacked list. Unset —
   * every other template — keeps the one-per-row model unchanged.
   */
  projectsGrid?: boolean;
  /**
   * This flow paints each certification as ONE row (name … issuer · date at
   * baseline) instead of the shared two-row stack. Unset keeps two rows.
   */
  certInlineMeta?: boolean;
  /**
   * This flow paints skills-list rows bare (no marker, the reference's 11.5px
   * lines on a 10px gap) instead of the shared bullet rows. Unset keeps bullets.
   */
  plainSkillList?: boolean;
  /**
   * Summary font size (em of the page base) this flow PAINTS at, when the
   * template pins it away from the shared {@link EM_SUMMARY} (the timeline-panel
   * design's 12px about text). Unset keeps the shared size.
   */
  summaryEm?: number;
  /**
   * PROSE line-heights this flow pins away from the theme's line-height slider,
   * because the imported design specifies them per tier (the timeline-panel
   * reference: 1.85 about, 1.6 bullets/descriptions, 1.7 achievements). The
   * template must paint the SAME values, or reserve and paint diverge. Unset —
   * every other template — keeps the slider governing every tier.
   */
  proseLineHeights?: { summary?: number; body?: number; achievement?: number };
  /**
   * This flow paints Key-Achievements as a PLAIN BULLET LIST (body-tier rows
   * behind a "•", the reference's `<ul>`) instead of the shared bold accent
   * cells. Unset keeps the shared cells.
   */
  achievementBullets?: boolean;
}

/** Per-column paint options a template pins away from the shared defaults. */
export interface ColumnMetricOptions {
  sectionTitleEm?: number;
  stackedEntries?: boolean;
  projectsGrid?: boolean;
  certInlineMeta?: boolean;
  plainSkillList?: boolean;
  summaryEm?: number;
  proseLineHeights?: { summary?: number; body?: number; achievement?: number };
  achievementBullets?: boolean;
  /**
   * Extra font-size multiplier this column PAINTS with on top of the theme's
   * font scale — the timeline-panel design's panel text scales with the panel's
   * own width (its `fontSize: <scale>em` card). All text-derived heights and
   * wrap capacities must price the same glyphs the column paints, so the
   * multiplier folds into every text-dependent closure. Unset (1) — every other
   * template — leaves the metrics byte-identical.
   */
  fontScaleMul?: number;
}

export function pxToMm(px: number): number {
  return px / PX_PER_MM;
}

export function createLayoutMetrics(theme: ThemeSettings): LayoutMetrics {
  const fontScale = theme.fontScale > 0 ? theme.fontScale : 1;
  const lineHeight = theme.lineHeight > 0 ? theme.lineHeight : 1.5;

  return {
    // Fixed 16mm top + 16mm bottom, from the single shared constant — never the
    // theme's margin slider — so every page of every template breaks against the
    // exact same 265mm usable height and the equal top/bottom margins are locked.
    usableHeightMm: A4_HEIGHT_MM - PAGE_MARGIN_MM * 2,
    sectionGapMm: theme.sectionSpacing,
    withinGapMm: WITHIN_SECTION_GAP_MM,
    lineMm: (em: number) => (BASE_FONT_PX * fontScale * em * lineHeight) / PX_PER_MM,
    lineMmAt: (em: number, lh: number) => (BASE_FONT_PX * fontScale * em * lh) / PX_PER_MM,
    emMm: (em: number) => (BASE_FONT_PX * fontScale * em) / PX_PER_MM,
    wrapCharsPerLine: (widthMm: number, em: number) =>
      Math.max(
        8,
        Math.floor(widthMm / (CHAR_MM_PER_FONT_PX * BASE_FONT_PX * fontScale * em)) -
          LINE_WRAP_LOSS_CHARS,
      ),
    // Wider glyphs at larger font scales fit fewer characters per line.
    charsPerLine: Math.max(20, Math.round(CHARS_PER_LINE_AT_BASE / fontScale)),
    bodyCharsPerLine: Math.max(16, Math.round(BODY_CHARS_PER_LINE_AT_BASE / fontScale)),
    // The horizontal inset still tracks the theme margin slider (which only tunes
    // left/right padding), so text-wrap estimates match the rendered content width.
    contentWidthMm: A4_WIDTH_MM - theme.pageMargin * 2,
  };
}

/**
 * Layout metrics for ONE column of a multi-column template. Identical to
 * {@link createLayoutMetrics} except the chars-per-line capacity is scaled to the
 * column's real content width — a narrow side column wraps text far more often
 * than the full single-column width the base constants were calibrated for, so
 * its blocks must be estimated taller. Height/line/gap math is unchanged because
 * the same item components render in every template; only the wrapping differs.
 */
export function createColumnMetrics(
  theme: ThemeSettings,
  contentWidthMm: number,
  /** What this column paints differently from the shared defaults. */
  options: ColumnMetricOptions = {},
): LayoutMetrics {
  const fontScale = theme.fontScale > 0 ? theme.fontScale : 1;
  const widthRatio = Math.max(0.2, contentWidthMm / REFERENCE_CONTENT_WIDTH_MM);
  const base = createLayoutMetrics(theme);
  // The column's own paint multiplier folds into every text closure as a larger
  // effective em — lineMm/emMm are linear in `em` and the wrap capacity is
  // linear in 1/em, so `f(em × mul)` prices exactly the glyphs the column
  // paints. `mul` 1 (every template that doesn't opt in) reproduces the base
  // closures bit-for-bit.
  const mul = options.fontScaleMul && options.fontScaleMul > 0 ? options.fontScaleMul : 1;

  return {
    ...base,
    lineMm: (em: number) => base.lineMm(em * mul),
    lineMmAt: (em: number, lh: number) => base.lineMmAt(em * mul, lh),
    emMm: (em: number) => base.emMm(em * mul),
    wrapCharsPerLine: (widthMm: number, em: number) => base.wrapCharsPerLine(widthMm, em * mul),
    charsPerLine: Math.max(14, Math.round((CHARS_PER_LINE_AT_BASE * widthRatio) / (fontScale * mul))),
    bodyCharsPerLine: Math.max(
      12,
      Math.round((BODY_CHARS_PER_LINE_AT_BASE * widthRatio) / (fontScale * mul)),
    ),
    contentWidthMm,
    sectionTitleEm: options.sectionTitleEm,
    stackedEntries: options.stackedEntries,
    projectsGrid: options.projectsGrid,
    certInlineMeta: options.certInlineMeta,
    plainSkillList: options.plainSkillList,
    summaryEm: options.summaryEm,
    proseLineHeights: options.proseLineHeights,
    achievementBullets: options.achievementBullets,
  };
}
