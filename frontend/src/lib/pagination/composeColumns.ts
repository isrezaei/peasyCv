import { packFlow } from "./composePages";
import type { ColumnPageLayout, ComposeColumnOptions } from "./types";

/**
 * Packs the side and main flows of a multi-column template independently, then
 * reports how many pages the template must render (the taller column wins). Each
 * flow keeps its own pagination, so the main column can run onto page 2 while the
 * side column finished on page 1 — exactly the fixed-A4, fill-then-overflow
 * behaviour every column template was missing. Packing itself is the shared
 * {@link packFlow}: each column fills before it breaks, with a distinct capacity
 * for page 1 (which may sit below a header or a photo aside) versus the full
 * height available on every following page, and an over-page splittable entry
 * breaks between its rows instead of overflowing.
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

  const mainPages = packFlow(main, mainFirst, usableHeightMm);
  const sidePages = packFlow(side, sideFirst, usableHeightMm);

  const pageCount = Math.max(mainPages.length, sidePages.length, 1);
  return { pageCount, main: mainPages, side: sidePages };
}
