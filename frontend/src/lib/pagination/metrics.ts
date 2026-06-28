import type { ThemeSettings } from "@/types";
import {
  A4_HEIGHT_MM,
  A4_WIDTH_MM,
  BASE_FONT_PX,
  BODY_CHARS_PER_LINE_AT_BASE,
  CHARS_PER_LINE_AT_BASE,
  PX_PER_MM,
  WITHIN_SECTION_GAP_MM,
} from "./constants";

/**
 * Content width (mm) the single-column chars-per-line constants were calibrated
 * against: the A4 width minus the default 16mm margins. A column narrower than
 * this fits proportionally fewer characters per line (text wraps more), so the
 * column metrics scale the line capacity by `contentWidthMm / this`.
 */
const REFERENCE_CONTENT_WIDTH_MM = A4_WIDTH_MM - 2 * 16;

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
  /** Approximate characters that fit on one line of full-width text (summary) at the current font scale. */
  charsPerLine: number;
  /** Approximate characters per line for body text wrapping inside a narrow entry column. */
  bodyCharsPerLine: number;
  /** Content width (mm) this flow renders at — used to wrap-aware estimate width-sensitive blocks (e.g. skill chips). */
  contentWidthMm: number;
}

export function pxToMm(px: number): number {
  return px / PX_PER_MM;
}

export function createLayoutMetrics(theme: ThemeSettings): LayoutMetrics {
  const fontScale = theme.fontScale > 0 ? theme.fontScale : 1;
  const lineHeight = theme.lineHeight > 0 ? theme.lineHeight : 1.5;

  return {
    usableHeightMm: A4_HEIGHT_MM - theme.pageMargin * 2,
    sectionGapMm: theme.sectionSpacing,
    withinGapMm: WITHIN_SECTION_GAP_MM,
    lineMm: (em: number) => (BASE_FONT_PX * fontScale * em * lineHeight) / PX_PER_MM,
    // Wider glyphs at larger font scales fit fewer characters per line.
    charsPerLine: Math.max(20, Math.round(CHARS_PER_LINE_AT_BASE / fontScale)),
    bodyCharsPerLine: Math.max(16, Math.round(BODY_CHARS_PER_LINE_AT_BASE / fontScale)),
    // A single full-width column spans the page content width.
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
export function createColumnMetrics(theme: ThemeSettings, contentWidthMm: number): LayoutMetrics {
  const fontScale = theme.fontScale > 0 ? theme.fontScale : 1;
  const widthRatio = Math.max(0.2, contentWidthMm / REFERENCE_CONTENT_WIDTH_MM);
  const base = createLayoutMetrics(theme);

  return {
    ...base,
    charsPerLine: Math.max(14, Math.round((CHARS_PER_LINE_AT_BASE * widthRatio) / fontScale)),
    bodyCharsPerLine: Math.max(12, Math.round((BODY_CHARS_PER_LINE_AT_BASE * widthRatio) / fontScale)),
    contentWidthMm,
  };
}
