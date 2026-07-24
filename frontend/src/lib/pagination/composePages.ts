import type { ComposeOptions, PageBlock, PageLayout } from "./types";

/**
 * Greedy, single-pass bin packing over pre-measured block heights. No DOM access
 * and no reflow: pages are derived purely from the height model plus the gap that
 * the layout renders between blocks, so this runs identically on every keystroke
 * and inside a headless renderer for PDF export.
 *
 * Guarantees:
 *  - A new page is started automatically whenever the next block (plus the gap
 *    above it) would exceed the usable page height — pages 2, 3, 4… always appear.
 *  - A `keepWithNext` block (a section heading) is never stranded at the foot of a
 *    page: it is reserved together with (at least the first split part of) its
 *    first entry, moving both to the next page when they would not fit.
 *  - A splittable block TALLER THAN A WHOLE PAGE (an experience entry with a very
 *    long responsibility list) is broken between its list rows: the first part
 *    (head + leading rows) fills the current page and title-less continuations
 *    flow onto the following pages. A block that fits a page is NEVER split, so
 *    ordinary layouts are unchanged.
 *  - An over-tall block that cannot split (or whose single row exceeds a page)
 *    still gets its own page rather than looping.
 *  - Block (and therefore section) ordering is always preserved.
 */
export function packFlow(
  blocks: PageBlock[],
  firstPageHeightMm: number,
  restPageHeightMm: number,
): PageBlock[][] {
  // The queue is spliced when an over-page block is replaced by its parts.
  const queue = [...blocks];
  const pages: PageBlock[][] = [];
  let current: PageBlock[] = [];
  let usedMm = 0; // block heights + inter-block gaps already placed on the current page
  // The first page may be shortened by a header/aside; later pages get full height.
  let capacityMm = firstPageHeightMm;

  for (let i = 0; i < queue.length; i += 1) {
    const block = queue[i];
    const next = queue[i + 1];

    const gapBefore = current.length > 0 ? block.gapBeforeMm : 0;
    // Keep a heading with the start of its first entry so it never strands alone.
    // For an over-page splittable entry the start is its first split part, not
    // the whole entry — the whole entry can never share a page with anything.
    const reserveMm =
      block.keepWithNext && next ? next.gapBeforeMm + minPlacementMm(next, restPageHeightMm) : 0;
    const projectedMm = usedMm + gapBefore + block.heightMm + reserveMm;

    // A splittable block breaks between rows instead of overflowing: either it is
    // over-page (can never fit as one unit) or it opts into splitToFill (run the
    // list out the bottom of THIS page rather than jump whole and leave a hole).
    // Fill the remaining space here (or break first when nothing fits under it),
    // then let the title-less continuations flow through the normal loop.
    const canSplit = block.split && (block.heightMm > restPageHeightMm || block.split.splitToFill);
    if (projectedMm > capacityMm && canSplit) {
      let parts = splitOversizeBlock(block, capacityMm - usedMm - gapBefore, restPageHeightMm);
      if (!parts && current.length > 0) {
        pages.push(current);
        current = [];
        usedMm = 0;
        capacityMm = restPageHeightMm;
        parts = splitOversizeBlock(block, capacityMm, restPageHeightMm);
      }
      if (parts) {
        queue.splice(i, 1, ...parts);
        i -= 1;
        continue;
      }
      // No split point at all (a single row taller than a page): fall through
      // to the legacy over-tall behaviour below.
    }

    if (projectedMm > capacityMm && current.length > 0) {
      pages.push(current);
      current = [block];
      usedMm = block.heightMm;
      capacityMm = restPageHeightMm;
      continue;
    }

    current.push(block);
    usedMm += gapBefore + block.heightMm;
  }

  if (current.length > 0) pages.push(current);
  return pages;
}

/** The smallest placement of a block: its first split part when the packer will
 *  split it (over-page, or splitToFill), otherwise the whole block. */
function minPlacementMm(block: PageBlock, restPageHeightMm: number): number {
  if (!block.split || (block.heightMm <= restPageHeightMm && !block.split.splitToFill)) {
    return block.heightMm;
  }
  const { headMm, listTopMm, unitMm, dateColumnMm, tailMm } = block.split;
  return Math.max(headMm + listTopMm + (unitMm[0] ?? 0), dateColumnMm) + tailMm;
}

/**
 * Breaks an over-page block between its list rows: the FIRST part carries the
 * entry head plus every leading row that fits `availableMm`, and the remaining
 * rows are chunked into title-less continuation parts of at most one full page
 * each. Returns null when not even head + first row fits the available space —
 * the caller then breaks the page first and retries against a whole page.
 */
function splitOversizeBlock(
  block: PageBlock,
  availableMm: number,
  fullPageHeightMm: number,
): PageBlock[] | null {
  const { headMm, listTopMm, unitMm, dateColumnMm, tailMm } = block.split!;
  const rows = unitMm.length;

  // First part: head + the longest row prefix that fits the available space.
  let take = 0;
  let prefixMm = 0;
  while (take < rows) {
    const withNext = Math.max(headMm + listTopMm + prefixMm + unitMm[take], dateColumnMm) + tailMm;
    if (withNext > availableMm) break;
    prefixMm += unitMm[take];
    take += 1;
  }
  if (take < 1 || take >= rows) return null;

  const parts: PageBlock[] = [
    {
      ...block,
      id: `${block.id}#0`,
      heightMm: Math.max(headMm + listTopMm + prefixMm, dateColumnMm) + tailMm,
      split: undefined,
      respRange: { start: 0, end: take },
    },
  ];

  // Continuations: maximal row runs of at most one page each. A pathological
  // single row taller than a page still becomes its own (over-tall) part.
  let start = take;
  while (start < rows) {
    let end = start;
    let sumMm = 0;
    while (end < rows && (end === start || listTopMm + sumMm + unitMm[end] + tailMm <= fullPageHeightMm)) {
      sumMm += unitMm[end];
      end += 1;
    }
    parts.push({
      ...block,
      id: `${block.id}#${parts.length}`,
      heightMm: listTopMm + sumMm + tailMm,
      split: undefined,
      respRange: { start, end },
      continuation: true,
    });
    start = end;
  }
  return parts;
}

/** Packs a single flow into fixed-height pages (see {@link packFlow}). */
export function composePages(blocks: PageBlock[], options: ComposeOptions): PageLayout[] {
  const { usableHeightMm } = options;
  const pages = packFlow(blocks, usableHeightMm, usableHeightMm).map((pageBlocks, pageIndex) => ({
    pageIndex,
    blocks: pageBlocks,
  }));

  return pages.length > 0 ? pages : [{ pageIndex: 0, blocks: [] }];
}
