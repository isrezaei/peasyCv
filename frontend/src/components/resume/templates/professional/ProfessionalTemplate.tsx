"use client";

import { useMemo } from "react";
import { Box, VStack } from "@chakra-ui/react";
import { A4Page } from "@/components/resume/canvas/A4Page";
import { BlockRenderer } from "@/components/resume/canvas/BlockRenderer";
import { ResumeBackground } from "@/components/resume/canvas/ResumeBackground";
import { SectionHoverFrame } from "@/components/resume/editor/SectionHoverFrame";
import { useResumeLayout } from "@/hooks/resume/useResumeLayout";
import { getFontStack } from "@/lib/fonts/registry";
import type { PageBlock } from "@/lib/pagination";
import { type ResolvedTheme, resolveTheme, resumeTextVars } from "@/lib/themes";
import type { SectionMeta, TemplateProps } from "@/types";

/**
 * ATS Friendly palette: no theme hue anywhere — every text tier inherits the
 * page's near-black body colour (`inherit`, so no new colour literal is
 * introduced) and every decorative source is transparent/undefined. Combined with
 * the leaf components that drop their graphics in ATS mode, the résumé renders as
 * plain black-on-white text only. `marker` stays undefined so the classic
 * per-element decoration sources (which are all suppressed anyway) never light up.
 */
const ATS_PLAIN_COLORS: ResolvedTheme = {
  accent: "inherit",
  secondary: "inherit",
  subtitle: "inherit",
  bodyText: "inherit",
  soft: "transparent",
  base: "transparent",
  contrastText: "inherit",
};

/** A page's blocks grouped into section runs so each section can be framed/hovered as one unit. */
interface BlockRun {
  key: string;
  section: SectionMeta | null;
  blocks: PageBlock[];
  /** Gap above the run (the first block's gap when it isn't first on the page). */
  topGapMm: number;
}

/**
 * Groups consecutive blocks that share a sectionId into a single run. A section
 * split across pages yields a run per page (the continuation has no title block);
 * the personal-info header (no sectionId) is always its own run. Pagination has
 * already run, so this purely-visual grouping never affects page composition.
 */
function groupIntoRuns(blocks: PageBlock[], sections: SectionMeta[]): BlockRun[] {
  const runs: BlockRun[] = [];
  blocks.forEach((block, index) => {
    const topGapMm = index === 0 ? 0 : block.gapBeforeMm;
    const prev = runs[runs.length - 1];
    if (block.sectionId && prev?.section?.id === block.sectionId) {
      prev.blocks.push(block);
      return;
    }
    const section = block.sectionId
      ? sections.find((candidate) => candidate.id === block.sectionId) ?? null
      : null;
    runs.push({ key: block.id, section, blocks: [block], topGapMm });
  });
  return runs;
}

export function ProfessionalTemplate({ resume, theme }: TemplateProps) {
  const pages = useResumeLayout(resume);
  const ats = theme.atsMode;

  // Derived presentation values change only with the theme, never on content
  // edits, so memoizing them keeps the strings fed to memoized blocks stable.
  // ATS Friendly mode swaps in the plain palette, a white page and no background
  // decoration — the layout (and its pagination estimate) is unchanged, only the
  // presentation.
  const colors = useMemo(() => (ats ? ATS_PLAIN_COLORS : resolveTheme(theme)), [theme, ats]);
  const fontStack = useMemo(() => getFontStack(theme.fontFamily), [theme.fontFamily]);
  // The A4 page is ALWAYS white. `theme.pageBackground` is a retained-but-dead
  // field (see ThemeSettings) kept only so old résumés still load/validate.
  const backgroundColor = "#FFFFFF";

  return (
    <VStack gap="6" align="center" className="resume-pages">
      {pages.map((page) => (
        <A4Page
          key={page.pageIndex}
          pageIndex={page.pageIndex}
          backgroundColor={backgroundColor}
          paddingMm={theme.pageMargin}
          fontStack={fontStack}
          fontScale={theme.fontScale}
          lineHeight={theme.lineHeight}
          decorations={
            ats ? null : <ResumeBackground theme={theme} colors={colors} idSuffix={`p${page.pageIndex}`} />
          }
          contentVars={resumeTextVars(colors.secondary, colors.bodyText, colors.subtitle)}
        >
          <Box>
            {groupIntoRuns(page.blocks, resume.sections).map((run) => {
              const renderBlock = (block: PageBlock, mt: string | number) => (
                <Box
                  key={block.id}
                  data-block-id={block.id}
                  data-block-kind={block.kind}
                  data-estimate-mm={block.heightMm.toFixed(2)}
                  mt={mt}
                >
                  <BlockRenderer block={block} resume={resume} accent={colors.accent} soft={colors.soft} marker={colors.marker} />
                </Box>
              );

              // A non-section run (the personal-info header) renders its blocks
              // plainly; PersonalInfoBlock supplies its own hover frame.
              if (!run.section) {
                return (
                  <Box key={run.key} mt={run.topGapMm ? `${run.topGapMm}mm` : 0}>
                    {run.blocks.map((block, i) => renderBlock(block, i === 0 ? 0 : `${block.gapBeforeMm}mm`))}
                  </Box>
                );
              }

              // The section title sits OUTSIDE the border (in the title row); the
              // remaining blocks are the bordered content beneath it.
              const hasTitle = run.blocks[0]?.kind === "sectionTitle";
              const titleBlock = hasTitle ? run.blocks[0] : null;
              const contentBlocks = hasTitle ? run.blocks.slice(1) : run.blocks;
              return (
                <Box key={run.key} mt={run.topGapMm ? `${run.topGapMm}mm` : 0}>
                  <SectionHoverFrame
                    section={run.section}
                    title={titleBlock ? renderBlock(titleBlock, 0) : null}
                  >
                    {contentBlocks.map((block, i) => renderBlock(block, i === 0 ? 0 : `${block.gapBeforeMm}mm`))}
                  </SectionHoverFrame>
                </Box>
              );
            })}
          </Box>
        </A4Page>
      ))}
    </VStack>
  );
}
