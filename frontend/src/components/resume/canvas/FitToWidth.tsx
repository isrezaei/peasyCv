"use client";

import { Box } from "@chakra-ui/react";
import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { A4_WIDTH_MM, PX_PER_MM } from "@/lib/pagination";

/**
 * The rendered width of one A4 page in CSS px. Browsers paint physical units at a
 * fixed 96dpi on screen (1mm = 96/25.4 px), so a `210mm` page is exactly this
 * many px — the same constant the page frame paints with. This is a RENDER value
 * only; it never enters the pagination engine.
 */
const A4_WIDTH_PX = A4_WIDTH_MM * PX_PER_MM;

/**
 * Scales the résumé canvas DOWN to fit a narrow viewport WITHOUT reflowing it.
 *
 * The A4 page keeps its exact `210mm` geometry, its content inset, and every
 * pagination input unchanged — pagination is a pure function of the résumé data
 * (see `composeResumeLayout`), so it produces byte-identical page breaks at every
 * viewport width. This component only applies a visual `transform: scale()` when
 * the page is wider than the space available, and sizes a wrapper to the SCALED
 * box so vertical scroll and horizontal centring stay correct.
 *
 * Mechanics:
 *  - `scale = min(1, availableWidth / A4_WIDTH_PX)` — never upscales, so desktop
 *    (where the page fits) is a no-op identity transform, byte-identical to before.
 *  - The inner box is anchored `position:absolute; inset-block-start/inline-start:0`
 *    with `transform-origin: top left`, so the scaled box has a deterministic
 *    physical top-left corner regardless of RTL — no directional drift.
 *  - The sizer reserves `A4_WIDTH_PX*scale × naturalHeight*scale` and centres with
 *    `marginInline: auto`; its height tracks the inner's UNTRANSFORMED height
 *    (`offsetHeight` / ResizeObserver `borderBoxSize`, both transform-agnostic).
 *
 * Editing keeps working on the scaled page: pointer hit-testing maps through the
 * transform, and the floating popovers (formatting, date picker) portal to `body`
 * and anchor via `getBoundingClientRect`, which already reports post-transform
 * viewport coordinates — so they land on the right spot.
 */
export function FitToWidth({ children }: { children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [naturalHeight, setNaturalHeight] = useState(0);

  const recomputeScale = useCallback(() => {
    const avail = outerRef.current?.clientWidth ?? 0;
    if (avail <= 0) return;
    // Clamp to 1 (never enlarge) and guard the low end so a transient 0 width
    // during a panel transition can't collapse the page to nothing.
    const next = Math.min(1, avail / A4_WIDTH_PX);
    setScale((prev) => (Math.abs(prev - next) > 0.001 ? next : prev));
  }, []);

  const recomputeHeight = useCallback(() => {
    // offsetHeight is the layout border-box height — unaffected by the transform,
    // so it is the page stack's TRUE (unscaled) height.
    const h = innerRef.current?.offsetHeight ?? 0;
    setNaturalHeight((prev) => (Math.abs(prev - h) > 0.5 ? h : prev));
  }, []);

  useLayoutEffect(() => {
    recomputeScale();
    recomputeHeight();
    const outer = outerRef.current;
    const inner = innerRef.current;
    const outerRo = new ResizeObserver(recomputeScale);
    const innerRo = new ResizeObserver(recomputeHeight);
    if (outer) outerRo.observe(outer);
    if (inner) innerRo.observe(inner);
    return () => {
      outerRo.disconnect();
      innerRo.disconnect();
    };
  }, [recomputeScale, recomputeHeight]);

  const scaled = scale < 1;

  return (
    <Box ref={outerRef} width="100%">
      <Box
        // The sizer reserves the SCALED footprint so the single vertical scroller
        // and the horizontal centring both see the real on-screen size.
        position="relative"
        marginInline="auto"
        style={{
          width: `${A4_WIDTH_PX * scale}px`,
          height: naturalHeight ? `${naturalHeight * scale}px` : undefined,
        }}
      >
        <Box
          ref={innerRef}
          position="absolute"
          // PHYSICAL top/left to match `transform-origin: top left` — using logical
          // insets here would anchor to the right in RTL and drift under the scale.
          top="0"
          left="0"
          style={{
            width: `${A4_WIDTH_PX}px`,
            transformOrigin: "top left",
            transform: scaled ? `scale(${scale})` : undefined,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
