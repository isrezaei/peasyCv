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
 * The «درباره من» section. It edits through the same shared RichTextField as every
 * other prose field, so it keeps the identical inline bold/italic/underline popover
 * and shows its guidance as a placeholder while empty. Its prose is JUSTIFIED by
 * default (`text-align: justify`) so each line fills the full column width for a
 * clean block — and that sits alongside the inline bold/italic marks, which keep
 * working within the justified text. Content persists as HTML on `summary.html`.
 */
export const SummaryBlock = memo(function SummaryBlock({ direction }: SummaryBlockProps) {
  const { html, updateSummary } = useSummary();

  return (
    <Box dir={direction} fontSize="0.92em">
      <RichTextField
        value={html}
        onChange={updateSummary}
        placeholder={t.summary.placeholder}
        dir={direction}
        textAlign="justify"
        color="var(--rz-body, #3f3f46)"
      />
    </Box>
  );
});
