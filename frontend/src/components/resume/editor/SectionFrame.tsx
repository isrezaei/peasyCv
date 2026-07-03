"use client";

import type { ReactNode } from "react";
import { Box } from "@chakra-ui/react";
import { SECTION_HOVER_FRAME_REVEAL } from "./HoverFrame";

interface SectionFrameProps {
  /** The section title (rendered heading). When null — e.g. a section continued on
   *  the next page — only the content is shown, with no title row. */
  title: ReactNode;
  /** The section control (the solid dots HoverFrame). */
  controls: ReactNode;
  /** The section content (its items each carry their own per-item hover frame). */
  children: ReactNode;
}

/**
 * Per-section shell. The dots control is OVERLAID, absolutely positioned at the
 * title row's inline-end and VERTICALLY CENTRED on the heading's first line (its
 * baseline) — decoupled from the layout flow, so it can NEVER push, crowd or
 * compress the real layout: the heading keeps its full width and any full-width
 * rule under it stays full length. Hovering anywhere in the section lifts the
 * resting low-opacity control to full opacity via {@link SECTION_HOVER_FRAME_REVEAL}.
 */
export function SectionFrame({ title, controls, children }: SectionFrameProps) {
  return (
    <Box css={SECTION_HOVER_FRAME_REVEAL}>
      {title ? (
        <Box position="relative">
          {title}
          {/* `1lh` at the heading's font-size makes this overlay exactly one heading
              line tall, so centring the control aligns it on the title baseline. */}
          <Box
            className="no-print"
            position="absolute"
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
