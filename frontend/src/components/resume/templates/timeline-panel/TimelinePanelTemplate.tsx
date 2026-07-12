"use client";

import { Box, HStack, VStack } from "@chakra-ui/react";
import { A4Page } from "@/components/resume/canvas/A4Page";
import { ColumnBody, type ColumnSectionRun } from "@/components/resume/canvas/ColumnBody";
import { ResumeBackground } from "@/components/resume/canvas/ResumeBackground";
import { TemplateSection } from "@/components/resume/sections/TemplateSection";
import { type ColumnTemplateLayout, useColumnLayout } from "@/hooks/resume/useColumnLayout";
import { getFontStack } from "@/lib/fonts/registry";
import { MODERN_COLUMN_INSET_MM, PAGE_MARGIN_MM, SIDE_COLUMN_PAD_FACTOR } from "@/lib/pagination";
import {
  ensureReadable,
  isDarkSurface,
  mixWithWhite,
  ON_DARK_SURFACE_TEXT,
  resolveTheme,
  resumeTextVars,
  tintColor,
} from "@/lib/themes";
import type { RemovableSectionType, TemplateProps } from "@/types";
import { PlainHeader } from "../_shared/PlainHeader";

/** Outer width (mm) of the tinted side panel — the ONE source the rendered
 *  column and the pagination width model both read. */
const SIDE_WIDTH_MM = 66;

/** The tinted side panel holds the supporting sections (قالب ۳). */
const LAYOUT: ColumnTemplateLayout = {
  // The tinted side panel carries only the achievements section for now (personal-
  // info sits in the full-width header strip); everything else flows in the main
  // column.
  sideTypes: new Set<RemovableSectionType>(["achievements"]),
  sideWidthMm: SIDE_WIDTH_MM,
  // This template paints the theme's modern column style, so the width model
  // may apply the modern inset (see useColumnLayout).
  supportsColumnStyle: true,
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
  // "modern" column style: the panel becomes a rounded box inset from the A4
  // edges, keeping its INNER boundary (the main column is untouched) and the
  // content's fixed 16mm vertical start (margin traded for padding) — the
  // sidebar-column mechanism, on the inline-END side this panel sits on. The
  // SAME inset useColumnLayout narrows the panel's content width by.
  const modern = theme.columnStyle === "modern";
  const insetMm = `${MODERN_COLUMN_INSET_MM.toFixed(2)}mm`;
  const sideBoxW = modern
    ? `${(SIDE_WIDTH_MM - MODERN_COLUMN_INSET_MM).toFixed(2)}mm`
    : `${SIDE_WIDTH_MM}mm`;
  const sidePadY = modern ? `${(PAGE_MARGIN_MM - MODERN_COLUMN_INSET_MM).toFixed(2)}mm` : padY;
  const panelBg = tintColor(colors.base, 0.55, theme.columnIntensity);
  // F: the tinted side panel keeps its accent-family text on a light tint, but flips
  // the whole tier (heading/body/subtitle/chip/placeholder) to the white family when
  // the tint lands dark, so the panel content is always readable.
  const panelOnDark = isDarkSurface(panelBg);
  const panelHeading = panelOnDark ? ON_DARK_SURFACE_TEXT.heading : ensureReadable(colors.accent, panelBg);
  const panelSecondary = panelOnDark
    ? ON_DARK_SURFACE_TEXT.heading
    : ensureReadable(colors.secondary, panelBg);
  const panelBody = panelOnDark ? ON_DARK_SURFACE_TEXT.body : ensureReadable(colors.bodyText, panelBg);
  const panelSubtitle = panelOnDark
    ? ON_DARK_SURFACE_TEXT.subtitle
    : ensureReadable(colors.subtitle, panelBg);
  const panelChip = panelOnDark ? ON_DARK_SURFACE_TEXT.chip : mixWithWhite(colors.accent, 0.84);
  const panelPlaceholder = panelOnDark ? ON_DARK_SURFACE_TEXT.placeholder : undefined;
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
      accent={panelHeading}
      soft={panelChip}
      titleColor={panelHeading}
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
                width={sideBoxW}
                flexShrink={0}
                bg={panelBg}
                color={panelBody}
                paddingBlock={sidePadY}
                paddingInline={sidePadX}
                // The panel is the last (inline-end) child, so the modern inset
                // margins push it off the end edge and the top/bottom.
                marginInlineEnd={modern ? insetMm : "0"}
                marginBlock={modern ? insetMm : "0"}
                borderRadius={modern ? "2xl" : "0"}
                gap="0"
                dir="rtl"
                style={resumeTextVars(panelSecondary, panelBody, panelSubtitle, panelPlaceholder)}
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
