"use client";

import type { ReactNode } from "react";
import { Box } from "@chakra-ui/react";
import { SectionSeparator } from "@/components/resume/sections/SectionSeparator";
import { SECTION_MIN_HEIGHT_MM, SECTION_TITLE_PAD_EM } from "@/lib/pagination";
import { useResumeStore } from "@/store/useResumeStore";
import { SECTION_HOVER_FRAME_REVEAL } from "./HoverFrame";

interface SectionFrameProps {
  /** The section title (rendered heading). When null — e.g. a section continued on
   *  the next page — only the content is shown, with no title row. */
  title: ReactNode;
  /** The section control (the solid dots HoverFrame). */
  controls: ReactNode;
  /** The section content (its items each carry their own per-item hover frame). */
  children: ReactNode;
  /** Light vs dark surface — forwarded to the optional title separator so its
   *  hairline stays readable on either. */
  tone?: "onLight" | "onDark";
  /** The section's text direction. The overlaid dots control anchors at the
   *  heading row's inline END *in this direction* — an LTR-flipped section reads
   *  from the left, so the control must sit at the right; under the page's RTL
   *  default it would land on the left, on top of the heading's first words. */
  dir?: "rtl" | "ltr";
}

/**
 * Per-section shell. The dots control is OVERLAID, absolutely positioned at the
 * title row's inline-end and VERTICALLY CENTRED on the heading's first line (its
 * baseline) — decoupled from the layout flow, so it can NEVER push, crowd or
 * compress the real layout: the heading keeps its full width and any full-width
 * rule under it stays full length. Hovering anywhere in the section lifts the
 * resting low-opacity control to full opacity via {@link SECTION_HOVER_FRAME_REVEAL}.
 */
export function SectionFrame({ title, controls, children, tone, dir }: SectionFrameProps) {
  // Same predicate the SectionSeparator renders under — here it only drives the
  // per-section min-height stabilizer; the title/content spacing is IDENTICAL
  // with the separator on or off.
  const separatorOn = useResumeStore(
    (state) => state.resume.theme.showSectionSeparators && !state.resume.theme.atsMode,
  );
  return (
    <Box
      css={SECTION_HOVER_FRAME_REVEAL}
      // Stabilizer: with separators on, a titled section never paints shorter
      // than the shared minimum, so the next title/separator can't crowd upward.
      // Only the run that carries the title — a continuation run on the next
      // page is never stretched. `min-height` never clips taller content.
      // buildSectionBlocks floors the section's reserved height with the SAME
      // constant, so paint and reserve agree.
      minHeight={title && separatorOn ? `${SECTION_MIN_HEIGHT_MM}mm` : undefined}
    >
      {title ? (
        <Box
          position="relative"
          // The title row's vertical rhythm lives HERE — as PADDING on a plain
          // block — not on the <h2>: heading margins are flex-item margins in
          // the icon+title row, and any asymmetry there shifts the title glyphs
          // off the icon's centre line (the E-11 misalignment). The pads are the
          // SAME with the separator on or off — the approved E-12 spacing.
          pt={`${SECTION_TITLE_PAD_EM}em`}
          pb={`${SECTION_TITLE_PAD_EM}em`}
        >
          {title}
          {/* Optional resume-wide hairline under the title — an absolute overlay
              centred in the existing bottom-pad + content-gap corridor, so it
              draws the line WITHIN the standard spacing and adds ZERO in-flow
              height: content sits in the same place with it on or off, and the
              title estimate is identical in both states. */}
          <SectionSeparator tone={tone} />

          {/* `1lh` at the heading's font-size makes this overlay exactly one heading
              line tall, so centring the control aligns it on the title baseline. */}
          <Box
            className="no-print"
            position="absolute"
            // `dir` makes the logical inset resolve in the SECTION's direction,
            // keeping the control at the heading's visual end when it's flipped.
            dir={dir}
            insetInlineEnd="0"
            top="0"
            display="flex"
            alignItems="center"
            height="1lh"
            minHeight="1.5em"
            fontSize="1.04em"
            lineHeight="inherit"
            zIndex="1"
          >
            {controls}
          </Box>
        </Box>
      ) : null}
      {/* Tight heading→content gap: a heading sits close to its section body.
          This single rule governs the title-to-content spacing for EVERY template
          (both the paginated and the column render paths flow through here). */}
      <Box mt={title ? "0.5" : "0"}>{children}</Box>
    </Box>
  );
}
