"use client";

import { Box } from "@chakra-ui/react";
import { memo } from "react";
import { useSummary } from "@/hooks/store/useSummary";
import { t } from "@/lib/i18n";
import type { Direction } from "@/types";
import { RichTextField } from "./RichTextField";

interface SummaryBlockProps {
  direction: Direction;
}

/**
 * The «درباره من» section. It now edits through the same shared RichTextField as
 * every other prose field, so it gets the identical inline bold/italic/underline
 * popover (item 9) and shows its guidance as a placeholder while empty (item 8) —
 * the summary is no longer seeded with example prose. Content persists as HTML on
 * `summary.html`, exactly as before.
 */
export const SummaryBlock = memo(function SummaryBlock({ direction }: SummaryBlockProps) {
  const { html, updateSummary } = useSummary();

  return (
    <Box
      dir={direction}
      fontSize="0.92em"
      textAlign={direction === "rtl" ? "right" : "left"}
    >
      <RichTextField
        value={html}
        onChange={updateSummary}
        placeholder={t.summary.placeholder}
        dir={direction}
      />
    </Box>
  );
});
