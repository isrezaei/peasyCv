"use client";

import { Box } from "@chakra-ui/react";
import { Fragment, type ReactNode } from "react";
import {
  type BlockRun,
  groupIntoRuns,
  type PageBlock,
  runHasTitle,
  runItemIds,
  type RunItemSlice,
  runItemSlices,
} from "@/lib/pagination";
import type { SectionMeta } from "@/types";

/** What a template needs to render one section run (possibly a page continuation). */
export interface ColumnSectionRun {
  section: SectionMeta;
  /**
   * Exact item refIds to render on this page (in order). Possibly empty for a
   * stranded title-only page; the item-less summary ignores it. Never a
   * "render all" sentinel — pagination always passes the precise slice.
   */
  itemIds: string[];
  /** False on a continuation page — render the content without the heading. */
  showTitle: boolean;
  /** Split-part slices for items broken between bullet rows by the packer
   *  (absent items render whole). */
  itemSlices: Record<string, RunItemSlice>;
  /** 0-based position of this run among the page's section runs. */
  index: number;
  /** Number of section runs on this page (so a template can tell the LAST one). */
  count: number;
  /**
   * Gap (mm) painted BELOW this run — the next run's own top gap, 0 when it is
   * the last run on the page. The timeline template spans its section rail across
   * exactly this corridor so the line reaches the next section's marker.
   */
  gapBelowMm: number;
}

interface ColumnBodyProps {
  /** This page's slice of one column's blocks. */
  blocks: PageBlock[];
  sections: SectionMeta[];
  /** Renders a single section run with the template's own heading/section treatment. */
  renderSection: (run: ColumnSectionRun) => ReactNode;
}

/**
 * Renders one paginated column: it regroups the page's already-packed blocks into
 * section runs and hands each to the template's `renderSection`, applying the gap
 * the engine reserved above the run. A section split across pages yields a
 * title-less continuation run on the later page, so headings never repeat.
 */
export function ColumnBody({ blocks, sections, renderSection }: ColumnBodyProps) {
  const runs = groupIntoRuns(blocks, sections);
  // Position among the SECTION runs only — the header run (section === null) is
  // never rendered here, so it must not consume an index or a gap slot.
  const sectionRuns = runs.filter((run: BlockRun) => run.section);
  return (
    <>
      {runs.map((run: BlockRun) => {
        if (!run.section) return <Fragment key={run.key} />;
        const index = sectionRuns.indexOf(run);
        return (
          <Box key={run.key} mt={run.topGapMm ? `${run.topGapMm}mm` : 0}>
            {renderSection({
              section: run.section,
              itemIds: runItemIds(run),
              showTitle: runHasTitle(run),
              itemSlices: runItemSlices(run),
              index,
              count: sectionRuns.length,
              gapBelowMm: sectionRuns[index + 1]?.topGapMm ?? 0,
            })}
          </Box>
        );
      })}
    </>
  );
}
