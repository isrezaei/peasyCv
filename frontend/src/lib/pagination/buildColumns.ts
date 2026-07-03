import { getVisibleSections, splitColumns } from "@/lib/resume/sectionLayout";
import type { RemovableSectionType, ResumeData } from "@/types";
import { buildSectionBlocks } from "./buildBlocks";
import type { LayoutMetrics } from "./metrics";
import type { PageBlock } from "./types";

export interface ColumnFlows {
  main: PageBlock[];
  side: PageBlock[];
}

/**
 * Splits a resume's visible sections into the main and side columns of a
 * multi-column template (using that template's own side-section set) and builds
 * each column's block flow with its OWN metrics — the narrow side column wraps
 * text more, so it is measured with column metrics scaled to its width. The
 * personal-info header is NOT included here; it is rendered once on page 1 and
 * reserved via the header/leading heights passed to {@link composeColumnPages}.
 */
export function buildColumnFlows(
  resume: ResumeData,
  sideTypes: ReadonlySet<RemovableSectionType>,
  mainMetrics: LayoutMetrics,
  sideMetrics: LayoutMetrics,
): ColumnFlows {
  const { main, side } = splitColumns(getVisibleSections(resume), sideTypes);
  return {
    main: main.flatMap((section) => buildSectionBlocks(resume, section, mainMetrics)),
    side: side.flatMap((section) => buildSectionBlocks(resume, section, sideMetrics)),
  };
}
