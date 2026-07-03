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
 *    page: it is reserved together with its first entry, moving both to the next
 *    page when they would not fit.
 *  - A block taller than a whole page still gets its own page rather than looping;
 *    atomic entries cannot be split in this stage.
 *  - Block (and therefore section) ordering is always preserved.
 */
export function composePages(blocks: PageBlock[], options: ComposeOptions): PageLayout[] {
  const { usableHeightMm } = options;
  const pages: PageLayout[] = [];

  let current: PageBlock[] = [];
  let usedMm = 0; // block heights + inter-block gaps already placed on the current page

  const flush = () => {
    if (current.length > 0) {
      pages.push({ pageIndex: pages.length, blocks: current });
      current = [];
      usedMm = 0;
    }
  };

  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i];
    const next = blocks[i + 1];

    const gapBefore = current.length > 0 ? block.gapBeforeMm : 0;
    // Keep a heading with the start of its first entry so it never strands alone.
    const reserveMm = block.keepWithNext && next ? next.gapBeforeMm + next.heightMm : 0;
    const projectedMm = usedMm + gapBefore + block.heightMm + reserveMm;

    if (projectedMm > usableHeightMm && current.length > 0) {
      flush();
      current.push(block);
      usedMm = block.heightMm;
      continue;
    }

    current.push(block);
    usedMm += gapBefore + block.heightMm;
  }

  flush();

  return pages.length > 0 ? pages : [{ pageIndex: 0, blocks: [] }];
}
