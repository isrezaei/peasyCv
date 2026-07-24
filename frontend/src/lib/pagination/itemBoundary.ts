import type { ID, ResumeData } from "@/types";
import { buildBlocks } from "./buildBlocks";
import { packFlow } from "./composePages";
import { PAGE_SAFETY_MM } from "./constants";
import { createLayoutMetrics } from "./metrics";
import type { PageBlock } from "./types";

/**
 * "Is this entry full for its page?" — the boundary behind the product rule that
 * an entry which has filled down to the page's bottom margin never grows (and
 * thereby never jumps to the next page): pressing Enter on it creates a NEW
 * sibling entry instead (see `addResponsibilityAfter` in createResumeSlice).
 *
 * The verdict is a pure simulation against the SAME pagination model the canvas
 * and /print render from — never a live DOM read: rebuild the entry's flow with
 * ONE more empty bullet line and ask the packer whether the entry's block would
 * start on a LATER page than it does today. Everything the real engine applies
 * (gaps, keepWithNext reservation, the section min-height stabilizer, over-page
 * splitting) is applied here too, because it IS the real engine.
 *
 * Nothing in this module mutates resume data. The layout hooks only REGISTER a
 * probe; creating the sibling entry lives in the store action and runs solely on
 * the user's Enter — a layout/render pass can never create items through this.
 */
export interface FlowPlan {
  blocks: PageBlock[];
  /** Capacity of the flow's first page (may sit below a header/leading reserve). */
  firstPageHeightMm: number;
  /** Capacity of every following page. */
  restPageHeightMm: number;
}

/** Builds every flow of the active template from a resume snapshot. */
export type FlowPlanner = (resume: ResumeData) => FlowPlan[];

export type ExperienceBoundaryProbe = (resume: ResumeData, experienceId: ID) => boolean;

/**
 * Would adding one empty bullet line move the entry's block (or, for an already
 * split over-page entry, its first part) to a later page? True means the entry
 * has reached the page's usable bottom: there is no room for another line where
 * it stands, so growing it would relocate it.
 */
export function experienceGrowthCrossesPage(
  planFlows: FlowPlanner,
  resume: ResumeData,
  experienceId: ID,
): boolean {
  const blockId = `experience-${experienceId}`;
  const baseFlows = planFlows(resume);
  const flowIndex = baseFlows.findIndex((flow) =>
    flow.blocks.some((block) => block.id === blockId),
  );
  if (flowIndex < 0) return false;

  const base = baseFlows[flowIndex];
  const before = pageStartOf(
    packFlow(base.blocks, base.firstPageHeightMm, base.restPageHeightMm),
    blockId,
  );
  if (before < 0) return false;

  const grown = planFlows(withProbeBullet(resume, experienceId))[flowIndex];
  if (!grown) return false;
  const after = pageStartOf(
    packFlow(grown.blocks, grown.firstPageHeightMm, grown.restPageHeightMm),
    blockId,
  );
  return after > before;
}

/** The single-column engine's flow plan (mirrors composeResumeLayout exactly). */
export const singleColumnFlowPlans: FlowPlanner = (resume) => {
  const metrics = createLayoutMetrics(resume.theme);
  const usableHeightMm = metrics.usableHeightMm - PAGE_SAFETY_MM;
  return [
    {
      blocks: buildBlocks(resume, metrics),
      firstPageHeightMm: usableHeightMm,
      restPageHeightMm: usableHeightMm,
    },
  ];
};

/** A data-only clone with one extra empty bullet on the probed entry — the exact
 *  edit the user's Enter would perform, priced by the exact same estimators. */
function withProbeBullet(resume: ResumeData, experienceId: ID): ResumeData {
  return {
    ...resume,
    experience: resume.experience.map((item) =>
      item.id === experienceId
        ? {
            ...item,
            responsibilities: [
              ...item.responsibilities,
              { id: "__boundary-probe__", text: "" },
            ],
          }
        : item,
    ),
  };
}

/** First page carrying the block — matched by id, or by `id#…` for the head part
 *  of an entry the packer split (over-page entries; they never "jump"). */
function pageStartOf(pages: PageBlock[][], blockId: string): number {
  for (let page = 0; page < pages.length; page += 1) {
    if (pages[page].some((block) => block.id === blockId || block.id.startsWith(`${blockId}#`))) {
      return page;
    }
  }
  return -1;
}

/**
 * The active template's probe. Registered by the layout hook of the mounted
 * template (useResumeLayout / useColumnLayout) so the store action always asks
 * the geometry that is actually rendering; unregistered on unmount. With no
 * probe registered (tests, non-editor surfaces) every add behaves normally.
 */
let activeProbe: ExperienceBoundaryProbe | null = null;

export function registerExperienceBoundaryProbe(probe: ExperienceBoundaryProbe): () => void {
  activeProbe = probe;
  return () => {
    if (activeProbe === probe) activeProbe = null;
  };
}

/** Store-action entry point: is this entry at the page-bottom boundary right now? */
export function isExperienceItemAtBoundary(resume: ResumeData, experienceId: ID): boolean {
  return activeProbe ? activeProbe(resume, experienceId) : false;
}
