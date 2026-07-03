import type { SectionMeta } from "@/types";
import type { PageBlock } from "./types";

/** A page's blocks grouped into section runs so each section renders as one unit. */
export interface BlockRun {
  key: string;
  /** The run's section, or null for the personal-info header run. */
  section: SectionMeta | null;
  blocks: PageBlock[];
  /** Gap above the run (the first block's gap when it isn't first on the page). */
  topGapMm: number;
}

/**
 * Groups consecutive blocks that share a sectionId into a single run. A section
 * split across pages yields a run per page (the continuation has no title block);
 * the personal-info header (no sectionId) is always its own run. Pagination has
 * already happened, so this purely-visual grouping never affects composition.
 */
export function groupIntoRuns(blocks: PageBlock[], sections: SectionMeta[]): BlockRun[] {
  const runs: BlockRun[] = [];
  blocks.forEach((block, index) => {
    const topGapMm = index === 0 ? 0 : block.gapBeforeMm;
    const prev = runs[runs.length - 1];
    if (block.sectionId && prev?.section?.id === block.sectionId) {
      prev.blocks.push(block);
      return;
    }
    const section = block.sectionId
      ? sections.find((candidate) => candidate.id === block.sectionId) ?? null
      : null;
    runs.push({ key: block.id, section, blocks: [block], topGapMm });
  });
  return runs;
}

/**
 * Item refIds carried by a run (excludes the section-title block). Always an
 * explicit list — possibly EMPTY when a run holds only a stranded section title
 * (its items paginated onto the next page). It must never collapse to a "render
 * all" sentinel, or a title-only page would dump the section's entire content.
 */
export function runItemIds(run: BlockRun): string[] {
  return run.blocks.map((block) => block.refId).filter((id): id is string => Boolean(id));
}

/** Whether a run opens with its section title (false on a continuation page). */
export function runHasTitle(run: BlockRun): boolean {
  return run.blocks[0]?.kind === "sectionTitle";
}
