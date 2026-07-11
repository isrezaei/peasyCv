import type { ProjectItem } from "@/types";

/**
 * Single source of truth for whether a project's link ROW exists.
 *
 * `ProjectItemBlock` (the one render path for every template, /print and
 * /share) and `estimateProjectItemHeight` (lib/pagination) MUST both call this
 * function: the estimator counts one link line iff the row renders, and that
 * agreement is what keeps the editor's page breaks identical to the exported
 * PDF's. Do NOT inline this at a call site — inlining reintroduces the
 * two-sources-of-truth divergence this helper exists to prevent.
 *
 * The row exists whenever `linkVisible` is on, even while `link` is empty: the
 * row then renders as the editable placeholder field (the only way to type a
 * URL), which occupies the same single line as the rendered anchor.
 */
export function shouldRenderProjectLink(item: Pick<ProjectItem, "linkVisible">): boolean {
  return item.linkVisible;
}
