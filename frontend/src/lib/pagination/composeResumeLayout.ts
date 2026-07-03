import type { ResumeData } from "@/types";
import { buildBlocks } from "./buildBlocks";
import { composePages } from "./composePages";
import { PAGE_SAFETY_MM } from "./constants";
import { createLayoutMetrics } from "./metrics";
import type { PageLayout } from "./types";

/**
 * Pure entry point: turns resume data + theme into a deterministic set of pages.
 * Everything the engine needs (page margin, font scale, line height, section
 * spacing) comes from `resume.theme`, so identical input always yields identical
 * pagination — on screen and in a future headless PDF render alike.
 */
export function composeResumeLayout(resume: ResumeData): PageLayout[] {
  const metrics = createLayoutMetrics(resume.theme);
  const blocks = buildBlocks(resume, metrics);

  return composePages(blocks, {
    // A small safety buffer keeps cumulative estimation error from ever reaching
    // the very bottom edge of the A4 frame.
    usableHeightMm: metrics.usableHeightMm - PAGE_SAFETY_MM,
  });
}
