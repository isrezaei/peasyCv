import type { ID } from "@/types";

export type BlockKind =
  | "personalInfo"
  | "sectionTitle"
  | "summary"
  | "experienceItem"
  | "skillGroup"
  | "educationItem"
  | "projectItem"
  | "languageItem"
  | "certificationItem";

export interface PageBlock {
  id: ID;
  kind: BlockKind;
  sectionId: ID | null;
  refId: ID | null;
  heightMm: number;
  keepWithNext: boolean;
  /**
   * Gap rendered immediately above this block when it is not the first block on
   * a page. Section headings carry the (large) section gap; blocks inside a
   * section carry the small within-section gap. The renderer and the packer read
   * the same value so on-screen spacing and pagination never diverge.
   */
  gapBeforeMm: number;
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
