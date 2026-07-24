import { useEffect, useMemo } from "react";
import {
  A4_HEIGHT_MM,
  A4_WIDTH_MM,
  buildColumnFlows,
  type ColumnPageLayout,
  composeColumnPages,
  type ComposeColumnOptions,
  createColumnMetrics,
  estimatePersonalBlockHeight,
  experienceGrowthCrossesPage,
  type FlowPlan,
  PAGE_MARGIN_MM,
  PAGE_SAFETY_MM,
  type PersonalBlockEstimate,
  registerExperienceBoundaryProbe,
  resolveSideWidthMm,
  SIDE_COLUMN_PAD_FACTOR,
} from "@/lib/pagination";
import type { ColumnWidthId, RemovableSectionType, ResumeData } from "@/types";

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
  /** Opt-in: `sideWidthMm` is a BASE the theme's "Column Layout" width preset
   *  offsets (see `resolveSideWidthMm`). The template must render its column at
   *  the same resolved width so paint and pagination stay in lockstep. */
  sideWidthAdjustable?: boolean;
  /** Side-column inner inline padding as a fraction of the page margin (defaults to
   *  the shared {@link SIDE_COLUMN_PAD_FACTOR}; templates share the same constant). */
  sidePadFactor?: number;
  /** For a flex split: the main/side flex weights and the inter-column gap in mm. */
  flex?: { main: number; side: number; gapMm: number };
  /**
   * Fixed horizontal chrome (mm) a column paints INSIDE its own width and which
   * therefore does not carry text — the timeline-panel design's per-section rail
   * gutter and the panel card's inner padding. Subtracted from the derived column
   * width so the wrap model measures the real text width. Unset (every other
   * template) leaves the widths untouched.
   */
  contentInsetMm?: { main?: number; side?: number };
  /**
   * Section-heading em each column PAINTS at, when the template pins it away from
   * the shared scale (see {@link LayoutMetrics.sectionTitleEm}). Unset keeps the
   * shared reserve.
   */
  sectionTitleEm?: { main?: number; side?: number };
  /**
   * Columns that paint DATED entries stacked instead of in the fixed date column
   * (see {@link LayoutMetrics.stackedEntries}). The template must pass the same
   * flag to its section renderer, or paint and reserve would diverge.
   */
  stackedEntries?: { main?: boolean; side?: boolean };
  /** Columns that paint Projects as the reference 2-up sub-grid
   *  (see {@link LayoutMetrics.projectsGrid}); same paint↔reserve contract. */
  projectsGrid?: { main?: boolean; side?: boolean };
  /** Columns that paint certifications as ONE «name … issuer · date» row
   *  (see {@link LayoutMetrics.certInlineMeta}); same paint↔reserve contract. */
  certInlineMeta?: { main?: boolean; side?: boolean };
  /** Columns that paint skills-list rows bare
   *  (see {@link LayoutMetrics.plainSkillList}); same paint↔reserve contract. */
  plainSkillList?: { main?: boolean; side?: boolean };
  /** Summary em each column paints at, when pinned away from the shared scale
   *  (see {@link LayoutMetrics.summaryEm}); same paint↔reserve contract. */
  summaryEm?: { main?: number; side?: number };
  /** Prose line-heights each column pins away from the theme's slider
   *  (see {@link LayoutMetrics.proseLineHeights}); same paint↔reserve contract. */
  proseLineHeights?: {
    main?: { summary?: number; body?: number; achievement?: number };
    side?: { summary?: number; body?: number; achievement?: number };
  };
  /** Columns that paint Key-Achievements as a plain bullet list
   *  (see {@link LayoutMetrics.achievementBullets}); same paint↔reserve contract. */
  achievementBullets?: { main?: boolean; side?: boolean };
  /** Extra paint font-scale per column (see {@link ColumnMetricOptions.fontScaleMul});
   *  the template must render the same multiplier on the column's wrapper. */
  fontScaleMul?: { main?: number; side?: number };
  /**
   * Template-owned VERTICAL page margin (mm). Unset — every other template —
   * keeps the shared locked {@link PAGE_MARGIN_MM}; the timeline-panel design
   * pins its reference's own 24px page padding instead. The template must paint
   * the SAME value as its `paddingBlock` (via the A4Page `bleed` escape), so the
   * painted frame and the engine's usable height stay in lockstep.
   */
  verticalMarginMm?: number;
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
  // While this template is mounted, page-bottom boundary questions (asked by the
  // add-bullet store action, never by rendering) are answered against ITS
  // geometry. Registration only stores a pure function — it cannot create or
  // change data.
  useEffect(
    () =>
      registerExperienceBoundaryProbe((current, experienceId) =>
        experienceGrowthCrossesPage(
          (snapshot) => columnFlowPlans(snapshot, layout),
          current,
          experienceId,
        ),
      ),
    [layout],
  );

  return useMemo(() => composeColumnPages(buildColumnPlan(resume, layout)), [resume, layout]);
}

/**
 * The pure pagination inputs of a column template — extracted from the hook so
 * the boundary probe simulates against the EXACT plan the canvas packs from.
 */
function buildColumnPlan(
  resume: ResumeData,
  layout: ColumnTemplateLayout,
): Required<ComposeColumnOptions> {
  const { theme, personalInfo } = resume;
  const margin = theme.pageMargin;
  const { mainWidthMm, sideWidthMm } = deriveColumnWidths(layout, margin, theme.columnWidth);

  const mainMetrics = createColumnMetrics(theme, mainWidthMm, {
    sectionTitleEm: layout.sectionTitleEm?.main,
    stackedEntries: layout.stackedEntries?.main,
    projectsGrid: layout.projectsGrid?.main,
    certInlineMeta: layout.certInlineMeta?.main,
    plainSkillList: layout.plainSkillList?.main,
    summaryEm: layout.summaryEm?.main,
    proseLineHeights: layout.proseLineHeights?.main,
    achievementBullets: layout.achievementBullets?.main,
    fontScaleMul: layout.fontScaleMul?.main,
  });
  const sideMetrics = createColumnMetrics(theme, sideWidthMm, {
    sectionTitleEm: layout.sectionTitleEm?.side,
    stackedEntries: layout.stackedEntries?.side,
    projectsGrid: layout.projectsGrid?.side,
    certInlineMeta: layout.certInlineMeta?.side,
    plainSkillList: layout.plainSkillList?.side,
    summaryEm: layout.summaryEm?.side,
    proseLineHeights: layout.proseLineHeights?.side,
    achievementBullets: layout.achievementBullets?.side,
    fontScaleMul: layout.fontScaleMul?.side,
  });
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

  // A template that owns its vertical margin breaks against ITS painted frame;
  // everyone else keeps the shared locked-16mm usable height untouched.
  const usableMm =
    layout.verticalMarginMm != null
      ? A4_HEIGHT_MM - 2 * layout.verticalMarginMm
      : mainMetrics.usableHeightMm;

  return {
    main,
    side,
    usableHeightMm: usableMm - PAGE_SAFETY_MM,
    headerHeightMm,
    mainReserveMm,
    sideReserveMm,
  };
}

/** The plan as per-flow capacities — the same first/rest split composeColumnPages
 *  hands to packFlow for each column. */
function columnFlowPlans(resume: ResumeData, layout: ColumnTemplateLayout): FlowPlan[] {
  const plan = buildColumnPlan(resume, layout);
  return [
    {
      blocks: plan.main,
      firstPageHeightMm: plan.usableHeightMm - plan.headerHeightMm - plan.mainReserveMm,
      restPageHeightMm: plan.usableHeightMm,
    },
    {
      blocks: plan.side,
      firstPageHeightMm: plan.usableHeightMm - plan.headerHeightMm - plan.sideReserveMm,
      restPageHeightMm: plan.usableHeightMm,
    },
  ];
}

/** Content widths (mm) of each column at the current page margin. */
function deriveColumnWidths(
  layout: ColumnTemplateLayout,
  margin: number,
  columnWidth: ColumnWidthId,
): { mainWidthMm: number; sideWidthMm: number } {
  const fullContent = A4_WIDTH_MM - 2 * margin;
  // Per-column chrome painted inside the column (rail gutter, panel card padding)
  // that no text can occupy. Zero for every template that does not declare it.
  const mainInset = layout.contentInsetMm?.main ?? 0;
  const sideInset = layout.contentInsetMm?.side ?? 0;
  const inset = (widthMm: number, insetMm: number) => Math.max(20, widthMm - insetMm);

  // Single column (no side sections, no fixed sidebar): the main column is full width.
  if (!layout.sideWidthMm && !layout.flex) {
    return { mainWidthMm: inset(fullContent, mainInset), sideWidthMm: inset(fullContent, sideInset) };
  }

  // Flex split (proportional columns sharing the page padding).
  if (layout.flex) {
    const inner = fullContent - layout.flex.gapMm;
    const total = layout.flex.main + layout.flex.side;
    return {
      mainWidthMm: inset((inner * layout.flex.main) / total, mainInset),
      sideWidthMm: inset((inner * layout.flex.side) / total, sideInset),
    };
  }

  // Fixed coloured sidebar (bleed page); the main column carries the page margin.
  // Width-adjustable templates offset the base width by the theme's preset.
  const sideBase = layout.sideWidthMm ?? 0;
  const sideOuter = layout.sideWidthAdjustable ? resolveSideWidthMm(sideBase, columnWidth) : sideBase;
  const sidePad = margin * (layout.sidePadFactor ?? SIDE_COLUMN_PAD_FACTOR);
  return {
    mainWidthMm: inset(A4_WIDTH_MM - sideOuter - 2 * margin, mainInset),
    sideWidthMm: inset(Math.max(20, sideOuter - 2 * sidePad), sideInset),
  };
}
