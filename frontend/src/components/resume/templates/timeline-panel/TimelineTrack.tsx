"use client";

import { Box } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { SECTION_TITLE_PAD_EM } from "@/lib/pagination";
import { dotCentrePx, type RailMetrics } from "./tokens";

/**
 * How a track's rail ENDS below its marker — the two treatments the reference
 * actually draws:
 *
 *  • `chain`   — the line runs past the section box and through the gap beneath
 *                it, stopping just above the NEXT section's marker (the
 *                reference's `bottom: -20px` on a `margin-bottom: 20px` section).
 *                Every non-final section in both regions.
 *  • `content` — the line stops at the bottom of the section's own content (the
 *                reference's final PANEL section, «مهارت‌ها», whose rail spans
 *                its list and stops there).
 *  • `none`    — marker only, no line (the reference's final MAIN sections,
 *                «پروژه‌ها» and «معرف‌ها», which carry no rail element at all).
 */
export type RailTail = "chain" | "content" | "none";

interface TimelineTrackProps {
  /** The region's rail metrics (main column vs side panel). */
  rail: RailMetrics;
  /** Rail line colour. */
  lineColor: string;
  /** Marker ring colour. */
  dotColor: string;
  /** Marker fill — the surface it sits on (page white / the panel wash). */
  dotFill: string;
  /**
   * Whether this track opens with a section TITLE. A page-continuation run has
   * none, so it carries no marker and its rail starts at the very top of the run
   * instead of at a marker centre — the line reads as one unbroken run across the
   * page break rather than restarting with a phantom node.
   */
  titled: boolean;
  tail: RailTail;
  /** Gap (mm) painted below this track, spanned by a `chain` tail. */
  gapBelowMm: number;
  children: ReactNode;
}

/**
 * One timeline row of the "timeline-panel" design: a fixed rail gutter carrying
 * the section's marker (and the line that links it to the next one), beside the
 * section's content.
 *
 * GEOMETRY. The reference puts the marker `dotTopPx` below the section box top,
 * where its `<h2>` line box also begins. This app's {@link SectionFrame} pads the
 * title row by {@link SECTION_TITLE_PAD_EM} first, so the marker (and the rail's
 * start) carry that SAME pad — the node lands on the heading exactly where the
 * reference puts it, at every font scale, because the pad is an em of the page
 * base. The `chain` tail spans the inter-section gap PLUS that pad, so the line
 * stops the reference's 3px above the next marker no matter what the section-
 * spacing slider is set to.
 *
 * RTL. The gutter is an ordinary flex item and the line is centred with logical
 * insets + `margin-inline: auto` — no physical left/right and no `translateX`
 * (whose sign would flip with the writing direction), so the rail sits on the
 * correct side in both directions with identical geometry.
 */
export function TimelineTrack({
  rail,
  lineColor,
  dotColor,
  dotFill,
  titled,
  tail,
  gapBelowMm,
  children,
}: TimelineTrackProps) {
  // The title pad only exists when this run paints a title.
  const titlePad = titled ? `${SECTION_TITLE_PAD_EM}em` : "0em";
  const railTop = titled ? `calc(${titlePad} + ${dotCentrePx(rail)}px)` : "0px";
  // `chain` reaches down through the gap AND the next section's title pad, so it
  // ends level with the next marker's top edge (the reference's 3px tuck).
  const railBottom =
    tail === "chain" ? `calc(-${gapBelowMm}mm - ${SECTION_TITLE_PAD_EM}em)` : "0px";

  return (
    <Box display="flex" alignItems="stretch">
      <Box
        position="relative"
        width={`${rail.columnPx}px`}
        flexShrink={0}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        {tail === "none" ? null : (
          <Box
            aria-hidden="true"
            position="absolute"
            // Centred WITHOUT a transform so the rail is identical in RTL/LTR
            // and rasterises on the same sub-pixel in the PDF as on screen.
            insetInlineStart="0"
            insetInlineEnd="0"
            marginInline="auto"
            top={railTop}
            bottom={railBottom}
            width={`${rail.linePx}px`}
            bg={lineColor}
            // Print backgrounds: keep the line's fill when Chrome renders the PDF.
            css={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
          />
        )}
        {titled ? (
          <Box
            aria-hidden="true"
            position="relative"
            zIndex={1}
            marginTop={`calc(${titlePad} + ${rail.dotTopPx}px)`}
            width={`${rail.dotPx}px`}
            height={`${rail.dotPx}px`}
            flexShrink={0}
            borderRadius="full"
            borderWidth={`${rail.dotBorderPx}px`}
            borderStyle="solid"
            borderColor={dotColor}
            bg={dotFill}
            css={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
          />
        ) : null}
      </Box>
      <Box flex="1" minWidth="0" paddingInlineStart={`${rail.contentPadPx}px`}>
        {children}
      </Box>
    </Box>
  );
}
