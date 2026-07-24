"use client";

import { Box, HStack, VStack } from "@chakra-ui/react";
import { A4Page } from "@/components/resume/canvas/A4Page";
import { ColumnBody, type ColumnSectionRun } from "@/components/resume/canvas/ColumnBody";
import { ResumeBackground } from "@/components/resume/canvas/ResumeBackground";
import { ProfileImageEditor } from "@/components/resume/editor/ProfileImageEditor";
import { TemplateSection } from "@/components/resume/sections/TemplateSection";
import { useResumeDocument } from "@/hooks/store/useResumeDocument";
import { type ColumnTemplateLayout, useColumnLayout } from "@/hooks/resume/useColumnLayout";
import { getFontStack } from "@/lib/fonts/registry";
import { PAGE_MARGIN_MM, SIDE_COLUMN_PAD_FACTOR } from "@/lib/pagination";
import {
  contrastRatio,
  darken,
  ensureReadable,
  ensureReadableOnDark,
  isDarkSurface,
  mixWithWhite,
  ON_DARK_SURFACE_TEXT,
  resolveTheme,
  resumeTextVars,
  shadeColor,
} from "@/lib/themes";
import type { RemovableSectionType, TemplateProps } from "@/types";
import { PlainHeader } from "../_shared/PlainHeader";

/** The dark aside carries the photo plus the supporting sections (قالب ۱). */
const LAYOUT: ColumnTemplateLayout = {
  sideTypes: new Set<RemovableSectionType>(["skills", "projects", "languages", "certifications"]),
  sideWidthMm: 72,
  header: {
    kind: "split",
    main: { identity: true, contacts: true },
    side: { photo: true, photoSizePx: 124, layout: "stack" },
  },
};

export function AsideDarkTemplate({ resume, theme }: TemplateProps) {
  const personalInfo = useResumeDocument().personalInfo;
  const colors = resolveTheme(theme);
  // Page is ALWAYS white (pageBackground is a dead field — see ThemeSettings).
  const mainBg = "#FFFFFF";
  const fontStack = getFontStack(theme.fontFamily);
  const gap = `${theme.sectionSpacing}mm`;
  // Fixed 16mm vertical margin (equal top/bottom); horizontal follows the slider,
  // tighter inside the dark aside.
  const padY = `${PAGE_MARGIN_MM}mm`;
  const padX = `${theme.pageMargin}mm`;
  const sidePadX = `${(theme.pageMargin * SIDE_COLUMN_PAD_FACTOR).toFixed(1)}mm`;
  const pages = useColumnLayout(resume, LAYOUT);

  const asideBg = shadeColor(colors.accent, 0.5, theme.columnIntensity);
  // F: the aside is dark by design, but the shade tracks the column-intensity
  // slider, and a light accent at low intensity can land the surface on the light
  // side of the threshold — so the tiers go through the same isDarkSurface switch
  // as the tinted columns: white family (one shared source, placeholder included)
  // on a dark shade, accent family deepened to AA when the shade lands light.
  const asideOnDark = isDarkSurface(asideBg);
  // The softened white alphas only clear AA once the shade is deep enough (white
  // itself ≥ 6:1); on the borderline band where white merely *wins* over black
  // (a light accent at low intensity), the body/subtitle/placeholder tiers stay
  // white but at higher strength so they keep AA on the mid-luminance shade.
  const deepShade = contrastRatio("#FFFFFF", asideBg) >= 6;
  const asideHeading = asideOnDark
    ? ON_DARK_SURFACE_TEXT.heading
    : ensureReadable(colors.accent, asideBg);
  const asideText = asideOnDark
    ? deepShade
      ? ON_DARK_SURFACE_TEXT.body
      : ON_DARK_SURFACE_TEXT.heading
    : ensureReadable(darken(colors.accent, 0.3), asideBg);
  const asideSubtitle = asideOnDark
    ? deepShade
      ? ON_DARK_SURFACE_TEXT.subtitle
      : ON_DARK_SURFACE_TEXT.heading
    : asideHeading;
  const asideAccent = asideOnDark
    ? ensureReadableOnDark(mixWithWhite(colors.accent, 0.55), asideBg)
    : asideText;
  const asideChip = asideOnDark ? ON_DARK_SURFACE_TEXT.chip : mixWithWhite(colors.accent, 0.84);
  const asidePlaceholder = asideOnDark
    ? deepShade
      ? ON_DARK_SURFACE_TEXT.placeholder
      : "rgba(255,255,255,0.78)"
    : undefined;

  const renderMain = ({ section, itemIds, showTitle, itemSlices }: ColumnSectionRun) => (
    <TemplateSection
      section={section}
      resume={resume}
      accent={colors.accent}
      soft={colors.soft}
      variant="underline"
      markerColor={colors.marker}
      compact
      itemIds={itemIds}
      itemSlices={itemSlices}
      showTitle={showTitle}
    />
  );
  const renderSide = ({ section, itemIds, showTitle, itemSlices }: ColumnSectionRun) => (
    <TemplateSection
      section={section}
      resume={resume}
      accent={asideAccent}
      soft={asideChip}
      titleColor={asideHeading}
      variant="underline"
      tone={asideOnDark ? "onDark" : "onLight"}
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
          bleed
          backgroundColor={mainBg}
          fontStack={fontStack}
          fontScale={theme.fontScale}
          lineHeight={theme.lineHeight}
          decorations={<ResumeBackground theme={theme} colors={colors} idSuffix={`aside-dark-p${page}`} />}
          contentVars={resumeTextVars(colors.secondary, colors.bodyText, colors.subtitle)}
        >
          <HStack align="stretch" gap="0" minH="inherit">
            <VStack align="stretch" flex="1" minW="0" paddingBlock={padY} paddingInline={padX} gap="0" dir="rtl">
              {page === 0 ? (
                <Box mb={gap}>
                  <PlainHeader accentColor={colors.accent} showPhoto={false} markerColor={colors.marker} />
                </Box>
              ) : null}
              <ColumnBody blocks={pages.main[page] ?? []} sections={resume.sections} renderSection={renderMain} />
            </VStack>

            <VStack
              align="stretch"
              width="72mm"
              flexShrink={0}
              bg={asideBg}
              color={asideText}
              paddingBlock={padY}
              paddingInline={sidePadX}
              gap="0"
              dir="rtl"
              style={resumeTextVars(asideHeading, asideText, asideSubtitle, asidePlaceholder)}
            >
              {page === 0 && personalInfo.fieldVisibility.photo ? (
                <Box alignSelf="center" mb={gap}>
                  <ProfileImageEditor size="124px" />
                </Box>
              ) : null}
              <ColumnBody blocks={pages.side[page] ?? []} sections={resume.sections} renderSection={renderSide} />
            </VStack>
          </HStack>
        </A4Page>
      ))}
    </VStack>
  );
}
