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
import { PlainHeader } from "../_shared/PlainHeader";

/** Single column with strong ruled headings (قالب ۶). Everything flows in one column. */
const LAYOUT: ColumnTemplateLayout = {
  sideTypes: new Set<RemovableSectionType>(),
  header: { kind: "full", estimate: { identity: true, contacts: true, photo: true } },
};

export function RuledSingleTemplate({ resume, theme }: TemplateProps) {
  const colors = resolveTheme(theme);
  const backgroundColor = theme.pageBackground === "white" ? "#FFFFFF" : colors.soft;
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
          decorations={<ResumeBackground theme={theme} colors={colors} idSuffix={`ruled-single-p${page}`} />}
          contentVars={resumeTextVars(colors.secondary, colors.bodyText, colors.subtitle)}
        >
          <VStack align="stretch" gap="0" dir="rtl">
            {page === 0 ? (
              <Box mb={gap}>
                <PlainHeader accentColor={colors.accent} markerColor={colors.marker} />
              </Box>
            ) : null}
            <ColumnBody
              blocks={pages.main[page] ?? []}
              sections={resume.sections}
              renderSection={({ section, itemIds, showTitle }) => (
                <TemplateSection
                  section={section}
                  resume={resume}
                  accent={colors.accent}
                  soft={colors.soft}
                  variant="solidUnderline"
                  markerColor={colors.marker}
                  itemIds={itemIds}
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
