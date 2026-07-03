import type { ColumnPageLayout, ComposeColumnOptions, PageBlock } from "./types";

/**
 * Greedy bin-packing of a single column's pre-measured blocks, identical in
 * spirit to {@link composePages} but with a distinct capacity for page 1 (which
 * may sit below a header or a photo aside) versus the full height available on
 * every following page. A block is only pushed to the next page once the current
 * page is genuinely full, so each column fills before it breaks; a heading is
 * kept with the start of its first entry; an over-tall block still gets its own
 * page rather than looping. Returns one block array per page of this column.
 */
function packColumn(
  blocks: PageBlock[],
  firstPageHeightMm: number,
  restPageHeightMm: number,
): PageBlock[][] {
  const pages: PageBlock[][] = [];
  let current: PageBlock[] = [];
  let usedMm = 0;
  // The first page may be shortened by a header/aside; later pages get full height.
  let capacityMm = firstPageHeightMm;

  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i];
    const next = blocks[i + 1];

    const gapBefore = current.length > 0 ? block.gapBeforeMm : 0;
    const reserveMm = block.keepWithNext && next ? next.gapBeforeMm + next.heightMm : 0;
    const projectedMm = usedMm + gapBefore + block.heightMm + reserveMm;

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

/**
 * Packs the side and main flows of a multi-column template independently, then
 * reports how many pages the template must render (the taller column wins). Each
 * flow keeps its own pagination, so the main column can run onto page 2 while the
 * side column finished on page 1 — exactly the fixed-A4, fill-then-overflow
 * behaviour every column template was missing.
 */
export function composeColumnPages(options: ComposeColumnOptions): ColumnPageLayout {
  const {
    main,
    side,
    usableHeightMm,
    headerHeightMm = 0,
    sideReserveMm = 0,
    mainReserveMm = 0,
  } = options;

  const mainFirst = usableHeightMm - headerHeightMm - mainReserveMm;
  const sideFirst = usableHeightMm - headerHeightMm - sideReserveMm;

  const mainPages = packColumn(main, mainFirst, usableHeightMm);
  const sidePages = packColumn(side, sideFirst, usableHeightMm);

  const pageCount = Math.max(mainPages.length, sidePages.length, 1);
  return { pageCount, main: mainPages, side: sidePages };
}
