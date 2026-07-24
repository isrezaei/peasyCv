"use client";

import { createContext, memo, useContext } from "react";
import { Box } from "@chakra-ui/react";
import { useAtsMode } from "@/hooks/store/useAtsMode";

/**
 * Opt-out for templates that draw their OWN timeline. The timeline-panel design
 * puts a single rail + marker beside each SECTION, so the per-entry rail would
 * paint a second, competing line inside it. A template wraps its pages in this
 * provider instead of forking the shared entry blocks; every other template keeps
 * the default (rail shown) and is untouched.
 *
 * Dropping the rail only frees horizontal space inside the entry — exactly what
 * ATS mode already does — so the height reserve stays valid (the text simply
 * wraps a touch less than estimated, which can only over-reserve).
 */
const EntryRailHiddenContext = createContext(false);

export const EntryRailHiddenProvider = EntryRailHiddenContext.Provider;

interface TimelineRailProps {
  /** Resume accent (resolved theme accent) used for the entry's dot. */
  accentColor: string;
}

/**
 * The vertical timeline rail that sits between an entry's date column and its
 * body. It draws a clearly visible full-height connecting line with an accent
 * dot at the top, shared by the Experience and Education entries so both read as
 * one timeline. `alignSelf="stretch"` makes the line span the entry's full
 * height even when the row aligns its children to the top, and the line/dot are
 * centred with logical insets so the rail is identical in RTL and LTR.
 */
export const TimelineRail = memo(function TimelineRail({ accentColor }: TimelineRailProps) {
  // ATS Friendly mode is text-only: the rail (a decorative line + dot) is dropped
  // entirely, which only frees horizontal space in the entry row.
  const ats = useAtsMode();
  // A template that paints its own section-level timeline suppresses this one.
  const hidden = useContext(EntryRailHiddenContext);
  if (ats || hidden) return null;

  return (
    <Box position="relative" flexShrink={0} alignSelf="stretch" width="9px" mx="1">
      {/* Connecting vertical line, centred in the rail. */}
      <Box
        data-testid="timeline-rail-line"
        position="absolute"
        insetInlineStart="50%"
        transform="translateX(-50%)"
        top="1.5"
        bottom="0"
        width="2px"
        borderRadius="full"
        bg="blackAlpha.200"
      />
      {/* Accent node at the top of the entry, with a white halo to lift it off the line. */}
      <Box
        position="absolute"
        insetInlineStart={"-0.5"}
        transform="translateX(-50%)"
        top="1"
        width="9px"
        height="9px"
        borderRadius="full"
        bg={accentColor}
        boxShadow="0 0 0 3px #fff, 0 0 0 4px rgba(0,0,0,0.06)"
      />
    </Box>
  );
});
