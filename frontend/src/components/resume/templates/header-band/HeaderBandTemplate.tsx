"use client";

import { HStack, VStack } from "@chakra-ui/react";
import { A4Page } from "@/components/resume/canvas/A4Page";
import { ColumnBody, type ColumnSectionRun } from "@/components/resume/canvas/ColumnBody";
import { ResumeBackground } from "@/components/resume/canvas/ResumeBackground";
import { TemplateSection } from "@/components/resume/sections/TemplateSection";
import { type ColumnTemplateLayout, useColumnLayout } from "@/hooks/resume/useColumnLayout";
import { getFontStack } from "@/lib/fonts/registry";
import { PAGE_MARGIN_MM } from "@/lib/pagination";
import {
  darken,
  ensureReadable,
  isDarkSurface,
  ON_DARK_SURFACE_TEXT,
  resolveTheme,
  resumeTextVars,
  tintColor,
} from "@/lib/themes";
import type { RemovableSectionType, TemplateProps } from "@/types";
import { HeaderBand } from "../_shared/HeaderBand";

/** The narrower column carries only achievements for now (قالب ۴). */
const LAYOUT: ColumnTemplateLayout = {
  // Personal-info lives in the coloured header band above; the aside is limited to
  // the achievements section, and every other section flows in the main column.
  sideTypes: new Set<RemovableSectionType>(["achievements"]),
  flex: { main: 1.5, side: 1, gapMm: 8 },
  // The band's TOP padding is the page's top margin (already in usableHeight); the
  // extra chrome reserved on page 1 is the band's BOTTOM padding plus the padded
  // HStack's top padding below it — i.e. margin × 2, not × 3 (which double-counted
  // the top padding and left a whole entry's worth of empty space on page 1).
  header: {
    kind: "full",
    estimate: { identity: true, contacts: true, photo: true, photoSizePx: 92 },
    chromeMm: (margin) => margin * 2,
  },
};

export function HeaderBandTemplate({ resume, theme }: TemplateProps) {
  const colors = resolveTheme(theme);
  const backgroundColor = theme.pageBackground === "white" ? "#FFFFFF" : colors.soft;
  const fontStack = getFontStack(theme.fontFamily);
  // Fixed 16mm vertical margin (equal top/bottom); horizontal follows the slider.
  const padY = `${PAGE_MARGIN_MM}mm`;
  const padX = `${theme.pageMargin}mm`;
  // D: the header band is tinted the SAME way the coloured side columns are — a
  // light white-mix of the marker/secondary via `tintColor` (0.45 baseline, tracked
  // by the column-intensity slider) — so it reads as a soft band, not a bold fill,
  // and matches the column colour exactly.
  const bandColor = tintColor(colors.marker ?? colors.base, 0.45, theme.columnIntensity);
  // F: choose readable text for whatever luminance that tint lands on — a dark band
  // flips to the white family; a light band keeps the accent HUE but deepens it via
  // ensureReadable so cross-hue palettes / high column-intensity still clear AA.
  const bandOnDark = isDarkSurface(bandColor);
  const bandHeading = bandOnDark ? ON_DARK_SURFACE_TEXT.heading : ensureReadable(colors.accent, bandColor);
  const bandSubtitle = bandOnDark
    ? ON_DARK_SURFACE_TEXT.subtitle
    : ensureReadable(darken(colors.accent, 0.15), bandColor);
  const bandPlaceholder = bandOnDark ? ON_DARK_SURFACE_TEXT.placeholder : "rgba(0,0,0,0.5)";
  const pages = useColumnLayout(resume, LAYOUT);

  const renderSection = ({ section, itemIds, showTitle }: ColumnSectionRun) => (
    <TemplateSection
      section={section}
      resume={resume}
      accent={colors.accent}
      soft={colors.soft}
      variant="solidUnderline"
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
          backgroundColor={backgroundColor}
          fontStack={fontStack}
          fontScale={theme.fontScale}
          lineHeight={theme.lineHeight}
          decorations={<ResumeBackground theme={theme} colors={colors} idSuffix={`header-band-p${page}`} />}
          contentVars={resumeTextVars(colors.secondary, colors.bodyText, colors.subtitle)}
        >
          <VStack align="stretch" gap="0" minH="inherit">
            {page === 0 ? (
              <HeaderBand
                bandColor={bandColor}
                heading={bandHeading}
                subtitle={bandSubtitle}
                placeholder={bandPlaceholder}
                tone={bandOnDark ? "onDark" : "onLight"}
                padMm={theme.pageMargin}
              />
            ) : null}
            <HStack align="flex-start" gap="8mm" paddingBlock={padY} paddingInline={padX} dir="rtl">
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
