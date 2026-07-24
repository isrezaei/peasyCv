"use client";

import { Box, HStack, VStack } from "@chakra-ui/react";
import { A4Page } from "@/components/resume/canvas/A4Page";
import { ColumnBody, type ColumnSectionRun } from "@/components/resume/canvas/ColumnBody";
import { ResumeBackground } from "@/components/resume/canvas/ResumeBackground";
import { TemplateSection } from "@/components/resume/sections/TemplateSection";
import { type ColumnTemplateLayout, useColumnLayout } from "@/hooks/resume/useColumnLayout";
import { getFontStack } from "@/lib/fonts/registry";
import { resolveTheme, resumeTextVars } from "@/lib/themes";
import type { RemovableSectionType, TemplateProps } from "@/types";
import { PlainHeader } from "../_shared/PlainHeader";

/** The supporting column holds the summary + secondary sections (قالب ۵). */
const LAYOUT: ColumnTemplateLayout = {
  sideTypes: new Set<RemovableSectionType>(["summary", "languages", "certifications"]),
  flex: { main: 1.5, side: 1, gapMm: 6.35 },
  header: { kind: "full", estimate: { identity: true, contacts: true, photo: true, extraPx: 18 } },
};

export function CompactDuoTemplate({ resume, theme }: TemplateProps) {
  const colors = resolveTheme(theme);
  // Page is ALWAYS white (pageBackground is a dead field — see ThemeSettings).
  const backgroundColor = "#FFFFFF";
  const fontStack = getFontStack(theme.fontFamily);
  const gap = `${theme.sectionSpacing}mm`;
  const pages = useColumnLayout(resume, LAYOUT);

  const renderSection = ({ section, itemIds, showTitle, itemSlices }: ColumnSectionRun) => (
    <TemplateSection
      section={section}
      resume={resume}
      accent={colors.accent}
      soft={colors.soft}
      variant="plain"
      markerColor={colors.marker}
      compact
      itemIds={itemIds}
      itemSlices={itemSlices}
      showTitle={showTitle}
    />
  );

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
          decorations={<ResumeBackground theme={theme} colors={colors} idSuffix={`compact-duo-p${page}`} />}
          contentVars={resumeTextVars(colors.secondary, colors.bodyText, colors.subtitle)}
        >
          <VStack align="stretch" gap="0">
            {page === 0 ? (
              <Box mb={gap}>
                <PlainHeader accentColor={colors.accent} divider markerColor={colors.marker} />
              </Box>
            ) : null}
            {/* Inter-column separator removed at the user's request — a vertical
                1px rule that only took horizontal space in the HStack's `gap="6"`,
                so no section's vertical height changed. */}
            <HStack align="flex-start" gap="6" dir="rtl">
              <VStack align="stretch" flex="1.5" minW="0" gap="0">
                <ColumnBody blocks={pages.main[page] ?? []} sections={resume.sections} renderSection={renderSection} />
              </VStack>
              <VStack align="stretch" flex="1" minW="0" gap="0">
                <ColumnBody blocks={pages.side[page] ?? []} sections={resume.sections} renderSection={renderSection} />
              </VStack>
            </HStack>
          </VStack>
        </A4Page>
      ))}
    </VStack>
  );
}
