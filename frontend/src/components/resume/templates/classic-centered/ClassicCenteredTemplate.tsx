"use client";

import { Box, VStack } from "@chakra-ui/react";
import { A4Page } from "@/components/resume/canvas/A4Page";
import { ColumnBody } from "@/components/resume/canvas/ColumnBody";
import { ResumeBackground } from "@/components/resume/canvas/ResumeBackground";
import { TemplateSection } from "@/components/resume/sections/TemplateSection";
import { type ColumnTemplateLayout, useColumnLayout } from "@/hooks/resume/useColumnLayout";
import { getFontStack } from "@/lib/fonts/registry";
import { resolveTheme, resumeTextVars } from "@/lib/themes";
import type { RemovableSectionType, TemplateProps } from "@/types";
import { CenteredHeader } from "../_shared/CenteredHeader";

/**
 * Centered classic layout (قالب ۷). The header and every section heading are
 * centred; the body keeps its natural RTL alignment. Single column, paginated.
 */
const LAYOUT: ColumnTemplateLayout = {
  sideTypes: new Set<RemovableSectionType>(),
  // The centered header stacks photo → name → title → contacts vertically.
  header: { kind: "full", estimate: { identity: true, contacts: true, photo: true, layout: "stack" } },
};

export function ClassicCenteredTemplate({ resume, theme }: TemplateProps) {
  const colors = resolveTheme(theme);
  // Page is ALWAYS white (pageBackground is a dead field — see ThemeSettings).
  const backgroundColor = "#FFFFFF";
  const fontStack = getFontStack(theme.fontFamily);
  const gap = `${theme.sectionSpacing}mm`;
  const pages = useColumnLayout(resume, LAYOUT);

  return (
    <VStack gap="6" align="center" className="resume-pages">
      {Array.from({ length: pages.pageCount }).map((_, page) => (
        <A4Page
          key={page}
          pageIndex={page}
          backgroundColor={backgroundColor}
          paddingMm={theme.pageMargin}
          fontStack={fontStack}
          fontScale={theme.fontScale}
          lineHeight={theme.lineHeight}
          decorations={
            <ResumeBackground theme={theme} colors={colors} idSuffix={`classic-centered-p${page}`} />
          }
          contentVars={resumeTextVars(colors.secondary, colors.bodyText, colors.subtitle)}
        >
          <VStack align="stretch" gap="0" dir="rtl">
            {page === 0 ? (
              <Box mb={gap}>
                <CenteredHeader accentColor={colors.accent} subtitleColor={colors.subtitle} markerColor={colors.marker} />
              </Box>
            ) : null}
            <ColumnBody
              blocks={pages.main[page] ?? []}
              sections={resume.sections}
              renderSection={({ section, itemIds, showTitle, itemSlices }) => (
                <TemplateSection
                  section={section}
                  resume={resume}
                  accent={colors.accent}
                  soft={colors.soft}
                  variant="centered"
                  markerColor={colors.marker}
                  itemIds={itemIds}
                  itemSlices={itemSlices}
                  showTitle={showTitle}
                />
              )}
            />
          </VStack>
        </A4Page>
      ))}
    </VStack>
  );
}
