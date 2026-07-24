import type { ID } from "@/types";

export type BlockKind =
  | "personalInfo"
  | "sectionTitle"
  | "summary"
  | "experienceItem"
  | "skillGroup"
  | "educationItem"
  | "projectItem"
  | "languageRow"
  | "certificationItem"
  | "achievementRow";

/**
 * Height breakdown that lets the packer BREAK one over-page block between its
 * list rows (today: an Experience entry's responsibilities). Present only on
 * blocks that can split; the packer touches it ONLY when the block is taller
 * than a whole page — an entry that fits a page still moves as one unit, so
 * every previously-fitting layout is byte-identical.
 */
export interface BlockSplitMeta {
  /** Fixed lead-in of the first part (titles, link, description). */
  headMm: number;
  /** The list's own top margin, painted above the rows in EVERY part. */
  listTopMm: number;
  /** Height of each list row, in order (row gap included). */
  unitMm: number[];
  /** Height floor of the first part's side (date) column. */
  dateColumnMm: number;
  /** Trailing padding painted at the bottom of every part. */
  tailMm: number;
  /**
   * Split this block to FILL the current page even when it would fit a whole
   * page on its own (the default only breaks a block taller than a full page).
   * The timeline-panel design's flowing side column sets it on the panel's plain
   * skill list, so a long list runs out the bottom of page 1 and continues on
   * page 2 instead of jumping whole and leaving a hole. Unset — every other
   * splittable block (Experience responsibilities) — keeps the move-whole-if-it-
   * fits behaviour, so no existing layout changes.
   */
  splitToFill?: boolean;
}

export interface PageBlock {
  id: ID;
  kind: BlockKind;
  sectionId: ID | null;
  refId: ID | null;
  /**
   * Item ids for a block that renders SEVERAL items as one vertical unit (the
   * languages and achievements grid rows). Single-item blocks keep using
   * `refId` and leave this unset; a row block sets this and leaves `refId` null.
   */
  refIds?: ID[];
  heightMm: number;
  keepWithNext: boolean;
  /**
   * Gap rendered immediately above this block when it is not the first block on
   * a page. Section headings carry the (large) section gap; blocks inside a
   * section carry the small within-section gap. The renderer and the packer read
   * the same value so on-screen spacing and pagination never diverge.
   */
  gapBeforeMm: number;
  /** Split pricing for a block the packer may break between rows (see {@link BlockSplitMeta}). */
  split?: BlockSplitMeta;
  /**
   * Set by the packer on the parts of a SPLIT block: the half-open row range
   * `[start, end)` of the source item's list this part renders.
   */
  respRange?: { start: number; end: number };
  /** True on the 2nd+ part of a split block — rendered without the entry head. */
  continuation?: boolean;
}

export interface PageLayout {
  pageIndex: number;
  blocks: PageBlock[];
}

export interface ComposeOptions {
  /** Printable height available on each page (A4 height minus margins, minus safety). */
  usableHeightMm: number;
}

/**
 * Pagination result for a multi-column template: the side and main flows are
 * packed independently, then zipped page-by-page. `side[i]` / `main[i]` are the
 * blocks that fall on page `i` of each column (either may be empty on a page —
 * e.g. the main flow runs onto page 2 while the side flow ended on page 1). The
 * template renders `pageCount` fixed A4 pages, each carrying that page's slice of
 * both columns, so every column template now overflows onto real new pages.
 */
export interface ColumnPageLayout {
  pageCount: number;
  main: PageBlock[][];
  side: PageBlock[][];
}

export interface ComposeColumnOptions {
  main: PageBlock[];
  side: PageBlock[];
  /** Printable height available on each page (A4 height minus margins, minus safety). */
  usableHeightMm: number;
  /** Full-width header height (incl. its trailing gap) reserved on page 1 of both columns. */
  headerHeightMm?: number;
  /** Leading content (photo + contacts) reserved at the top of the side column on page 1. */
  sideReserveMm?: number;
  /** Leading content (identity) reserved at the top of the main column on page 1. */
  mainReserveMm?: number;
}
