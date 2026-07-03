"use client";

import { Box } from "@chakra-ui/react";
import { Fragment, type ReactNode } from "react";
import { type BlockRun, groupIntoRuns, type PageBlock, runHasTitle, runItemIds } from "@/lib/pagination";
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
  return (
    <>
      {runs.map((run: BlockRun) =>
        run.section ? (
          <Box key={run.key} mt={run.topGapMm ? `${run.topGapMm}mm` : 0}>
            {renderSection({
              section: run.section,
              itemIds: runItemIds(run),
              showTitle: runHasTitle(run),
            })}
          </Box>
        ) : (
          <Fragment key={run.key} />
        ),
      )}
    </>
  );
}
