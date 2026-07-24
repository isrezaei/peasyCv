/**
 * The app's responsive breakpoint strategy, stated once.
 *
 *   phone   : base … < md   (< 768px)  — compact top bar, panel is a closed
 *                                        overlay drawer, A4 page scaled to fit.
 *   tablet  : md … < xl     (768–1279) — same overlay drawer + closed-by-default;
 *                                        the top bar keeps the compact bar below
 *                                        `lg` and the full floating dock at `lg`+.
 *   desktop : xl+           (≥ 1280px) — the original layout: inline docked side
 *                                        panel, open by default, full top-bar dock.
 *
 * The single hinge is {@link DESKTOP_MIN_PX} (Chakra's `xl`): below it the side
 * panel is an overlay drawer that starts CLOSED; at/above it the panel is the
 * inline docked panel that starts OPEN (unchanged desktop behaviour). The top
 * bar collapses one step earlier, at `lg`, because the full floating dock still
 * fits a 992–1279px laptop.
 *
 * NONE of these values ever feed the pagination engine — the A4 page keeps its
 * exact mm geometry at every breakpoint (see FitToWidth, which only SCALES it).
 */

/** Chakra `xl` in px — the desktop / overlay-drawer hinge. */
export const DESKTOP_MIN_PX = 1280;

/** True when the viewport is desktop-width. SSR (no `window`) resolves to false,
 *  which is why it is only read in the client-only editor tree. */
export function isDesktopViewport(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(`(min-width: ${DESKTOP_MIN_PX}px)`).matches;
}
