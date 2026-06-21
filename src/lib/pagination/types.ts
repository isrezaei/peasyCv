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
