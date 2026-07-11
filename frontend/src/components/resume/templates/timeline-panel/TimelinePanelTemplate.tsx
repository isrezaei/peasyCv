"use client";

import { Box, HStack, VStack } from "@chakra-ui/react";
import { A4Page } from "@/components/resume/canvas/A4Page";
import { ColumnBody, type ColumnSectionRun } from "@/components/resume/canvas/ColumnBody";
import { ResumeBackground } from "@/components/resume/canvas/ResumeBackground";
import { TemplateSection } from "@/components/resume/sections/TemplateSection";
import { type ColumnTemplateLayout, useColumnLayout } from "@/hooks/resume/useColumnLayout";
import { getFontStack } from "@/lib/fonts/registry";
import { PAGE_MARGIN_MM, SIDE_COLUMN_PAD_FACTOR } from "@/lib/pagination";
import { mixWithWhite, resolveTheme, resumeTextVars, tintColor } from "@/lib/themes";
import type { RemovableSectionType, TemplateProps } from "@/types";
import { PlainHeader } from "../_shared/PlainHeader";

/** The tinted side panel holds the supporting sections (قالب ۳). */
const LAYOUT: ColumnTemplateLayout = {
  sideTypes: new Set<RemovableSectionType>(["skills", "languages", "certifications"]),
  sideWidthMm: 66,
  // Full-width header strip (padding + bottom rule) reserved on page 1.
  header: {
    kind: "full",
    estimate: { identity: true, contacts: true, photo: true, photoSizePx: 86 },
    chromeMm: (margin) => margin + 5,
  },
};

export function TimelinePanelTemplate({ resume, theme }: TemplateProps) {
  const colors = resolveTheme(theme);
  const mainBg = theme.pageBackground === "white" ? "#FFFFFF" : colors.soft;
  const fontStack = getFontStack(theme.fontFamily);
  // Fixed 16mm vertical margin (equal top/bottom on every page); horizontal follows
  // the slider, tighter inside the tinted side panel.
  const padY = `${PAGE_MARGIN_MM}mm`;
  const padX = `${theme.pageMargin}mm`;
  const sidePadX = `${(theme.pageMargin * SIDE_COLUMN_PAD_FACTOR).toFixed(1)}mm`;
  const panelBg = tintColor(colors.base, 0.55, theme.columnIntensity);
  const pages = useColumnLayout(resume, LAYOUT);

  const renderMain = ({ section, itemIds, showTitle }: ColumnSectionRun) => (
    <TemplateSection
      section={section}
      resume={resume}
      accent={colors.accent}
      soft={colors.soft}
      variant="bar"
      markerColor={colors.marker}
      compact
      itemIds={itemIds}
      showTitle={showTitle}
    />
  );
  const renderSide = ({ section, itemIds, showTitle }: ColumnSectionRun) => (
    <TemplateSection
      section={section}
      resume={resume}
      accent={colors.accent}
      soft={mixWithWhite(colors.accent, 0.84)}
      titleColor={colors.accent}
      variant="plain"
      markerColor={colors.marker}
      compact
      itemIds={itemIds}
      showTitle={showTitle}
    />
  );

  return (
    <VStack gap="6" align="center" className="resume-pages">
      {Array.from({ length: pages.pageCount }).map((_, page) => (
        <A4Page
          key={page}
          pageIndex={page}
          bleed
          backgroundColor={mainBg}
          fontStack={fontStack}
          fontScale={theme.fontScale}
          lineHeight={theme.lineHeight}
          decorations={<ResumeBackground theme={theme} colors={colors} idSuffix={`timeline-panel-p${page}`} />}
          contentVars={resumeTextVars(colors.secondary, colors.bodyText, colors.subtitle)}
        >
          <Box display="flex" flexDirection="column" minH="inherit">
            {page === 0 ? (
              <Box pt={padY} px={padX} pb="4" borderBottomWidth="1px" borderColor="blackAlpha.200">
                <PlainHeader accentColor={colors.accent} markerColor={colors.marker} />
              </Box>
            ) : null}
            <HStack align="stretch" flex="1" gap="0">
              <VStack align="stretch" flex="1" minW="0" paddingBlock={padY} paddingInline={padX} gap="0" dir="rtl">
                <ColumnBody blocks={pages.main[page] ?? []} sections={resume.sections} renderSection={renderMain} />
              </VStack>
              <VStack
                align="stretch"
                width="66mm"
                flexShrink={0}
                bg={panelBg}
                color={colors.bodyText}
                paddingBlock={padY}
                paddingInline={sidePadX}
                gap="0"
                dir="rtl"
                style={resumeTextVars(colors.secondary, colors.bodyText, colors.subtitle)}
              >
                <ColumnBody blocks={pages.side[page] ?? []} sections={resume.sections} renderSection={renderSide} />
              </VStack>
            </HStack>
          </Box>
        </A4Page>
      ))}
    </VStack>
  );
}
