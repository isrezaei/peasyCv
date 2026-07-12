import { useMemo } from "react";
import {
  A4_WIDTH_MM,
  buildColumnFlows,
  type ColumnPageLayout,
  composeColumnPages,
  createColumnMetrics,
  estimatePersonalBlockHeight,
  MODERN_COLUMN_INSET_MM,
  PAGE_MARGIN_MM,
  PAGE_SAFETY_MM,
  type PersonalBlockEstimate,
  SIDE_COLUMN_PAD_FACTOR,
} from "@/lib/pagination";
import type { ColumnStyle, RemovableSectionType, ResumeData } from "@/types";

/**
 * Margin-dependent header chrome (band/strip padding) in mm. Defined at module
 * scope (a stable reference) so it can live on the static layout descriptor.
 */
export type MarginChrome = (margin: number) => number;

/** How a template paints its personal-info header, so the engine reserves page-1 space. */
export type ColumnHeaderSpec =
  | { kind: "none" }
  // A full-width header above both columns on page 1 (e.g. a header band, a
  // centered header, the double-column header). `chromeMm` adds the band/strip
  // padding that scales with the page margin.
  | { kind: "full"; estimate: PersonalBlockEstimate; chromeMm?: MarginChrome }
  // A split header: leading content inside each column on page 1 (e.g. the
  // identity in the main column, the photo + contacts in the coloured aside).
  | { kind: "split"; main: PersonalBlockEstimate; side: PersonalBlockEstimate };

/**
 * Stable, template-level geometry descriptor (define it at module scope so its
 * reference never changes between renders). The margin-dependent column widths
 * are derived from it inside the hook.
 */
export interface ColumnTemplateLayout {
  sideTypes: ReadonlySet<RemovableSectionType>;
  /** Fixed outer width (mm) of the coloured/side column, or null for a flex split. */
  sideWidthMm?: number | null;
  /** Side-column inner inline padding as a fraction of the page margin (defaults to
   *  the shared {@link SIDE_COLUMN_PAD_FACTOR}; templates share the same constant). */
  sidePadFactor?: number;
  /** For a flex split: the main/side flex weights and the inter-column gap in mm. */
  flex?: { main: number; side: number; gapMm: number };
  /**
   * The template PAINTS the theme's "modern" column style (rounded corners +
   * {@link MODERN_COLUMN_INSET_MM} inset on its fixed coloured sidebar). Only
   * when this is set does the width model apply the modern inset — so the
   * estimator can never assume a narrower column that a template (e.g. the
   * retired aside skins) doesn't actually draw.
   */
  supportsColumnStyle?: boolean;
  header: ColumnHeaderSpec;
}

/**
 * Column-aware pagination for every multi/single-column template. Builds each
 * column's block flow with width-correct metrics, reserves page-1 space for the
 * header, then packs the flows into fixed A4 pages that fill before they break.
 */
export function useColumnLayout(
  resume: ResumeData,
  layout: ColumnTemplateLayout,
): ColumnPageLayout {
  return useMemo(() => {
    const { theme, personalInfo } = resume;
    const margin = theme.pageMargin;
    // Only style-aware templates narrow the column for "modern" — the SAME
    // condition their renderer paints the inset box under.
    const columnStyle: ColumnStyle = layout.supportsColumnStyle ? theme.columnStyle : "classic";
    const { mainWidthMm, sideWidthMm } = deriveColumnWidths(layout, margin, columnStyle);

    const mainMetrics = createColumnMetrics(theme, mainWidthMm);
    const sideMetrics = createColumnMetrics(theme, sideWidthMm);
    const { main, side } = buildColumnFlows(resume, layout.sideTypes, mainMetrics, sideMetrics);

    // Gap between the header/leading block and the first section beneath it.
    const gap = theme.sectionSpacing;
    let headerHeightMm = 0;
    let mainReserveMm = 0;
    let sideReserveMm = 0;
    if (layout.header.kind === "full") {
      // Header band/strip chrome is a VERTICAL reserve, so it scales with the
      // fixed 16mm page margin (the band's own top padding is the page top margin),
      // never the horizontal slider.
      const chrome = layout.header.chromeMm?.(PAGE_MARGIN_MM) ?? 0;
      headerHeightMm =
        estimatePersonalBlockHeight(personalInfo, mainMetrics, layout.header.estimate) + chrome + gap;
    } else if (layout.header.kind === "split") {
      mainReserveMm = estimatePersonalBlockHeight(personalInfo, mainMetrics, layout.header.main) + gap;
      sideReserveMm = estimatePersonalBlockHeight(personalInfo, sideMetrics, layout.header.side) + gap;
    }

    return composeColumnPages({
      main,
      side,
      usableHeightMm: mainMetrics.usableHeightMm - PAGE_SAFETY_MM,
      headerHeightMm,
      mainReserveMm,
      sideReserveMm,
    });
  }, [resume, layout]);
}

/** Content widths (mm) of each column at the current page margin. */
function deriveColumnWidths(
  layout: ColumnTemplateLayout,
  margin: number,
  columnStyle: ColumnStyle,
): { mainWidthMm: number; sideWidthMm: number } {
  const fullContent = A4_WIDTH_MM - 2 * margin;

  // Single column (no side sections, no fixed sidebar): the main column is full width.
  if (!layout.sideWidthMm && !layout.flex) {
    return { mainWidthMm: fullContent, sideWidthMm: fullContent };
  }

  // Flex split (proportional columns sharing the page padding).
  if (layout.flex) {
    const inner = fullContent - layout.flex.gapMm;
    const total = layout.flex.main + layout.flex.side;
    return {
      mainWidthMm: (inner * layout.flex.main) / total,
      sideWidthMm: (inner * layout.flex.side) / total,
    };
  }

  // Fixed coloured sidebar (bleed page); the main column carries the page margin.
  // The "modern" style keeps the sidebar's INNER boundary (so the main column is
  // untouched) and pulls the outer edge in by the inset, narrowing only the
  // sidebar's own box — and therefore its usable content width — by exactly
  // MODERN_COLUMN_INSET_MM. Same box width the style-aware templates paint.
  const sideOuter = layout.sideWidthMm ?? 0;
  const sideBox = columnStyle === "modern" ? sideOuter - MODERN_COLUMN_INSET_MM : sideOuter;
  const sidePad = margin * (layout.sidePadFactor ?? SIDE_COLUMN_PAD_FACTOR);
  return {
    mainWidthMm: A4_WIDTH_MM - sideOuter - 2 * margin,
    sideWidthMm: Math.max(20, sideBox - 2 * sidePad),
  };
}
