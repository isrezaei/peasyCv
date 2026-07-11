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
import { mixWithWhite, resolveTheme, resumeTextVars, shadeColor } from "@/lib/themes";
import type { RemovableSectionType, TemplateProps } from "@/types";
import { PlainHeader } from "../_shared/PlainHeader";

/** The dark aside carries the photo plus the supporting sections (قالب ۱). */
const LAYOUT: ColumnTemplateLayout = {
  sideTypes: new Set<RemovableSectionType>(["skills", "projects", "languages", "certifications"]),
  sideWidthMm: 72,
  header: {
    kind: "split",
    main: { identity: true, contacts: true },
    side: { photo: true, photoSizePx: 104, layout: "stack" },
  },
};

export function AsideDarkTemplate({ resume, theme }: TemplateProps) {
  const personalInfo = useResumeDocument().personalInfo;
  const colors = resolveTheme(theme);
  const mainBg = theme.pageBackground === "white" ? "#FFFFFF" : colors.soft;
  const fontStack = getFontStack(theme.fontFamily);
  const gap = `${theme.sectionSpacing}mm`;
  // Fixed 16mm vertical margin (equal top/bottom); horizontal follows the slider,
  // tighter inside the dark aside.
  const padY = `${PAGE_MARGIN_MM}mm`;
  const padX = `${theme.pageMargin}mm`;
  const sidePadX = `${(theme.pageMargin * SIDE_COLUMN_PAD_FACTOR).toFixed(1)}mm`;
  const pages = useColumnLayout(resume, LAYOUT);

  const asideBg = shadeColor(colors.accent, 0.5, theme.columnIntensity);
  const asideHeading = "#FFFFFF";
  const asideText = "rgba(255,255,255,0.80)";
  const asideSubtitle = "rgba(255,255,255,0.88)";
  const asideAccent = mixWithWhite(colors.accent, 0.55);
  const asideChip = "rgba(255,255,255,0.12)";

  const renderMain = ({ section, itemIds, showTitle }: ColumnSectionRun) => (
    <TemplateSection
      section={section}
      resume={resume}
      accent={colors.accent}
      soft={colors.soft}
      variant="underline"
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
      accent={asideAccent}
      soft={asideChip}
      titleColor={asideHeading}
      variant="underline"
      tone="onDark"
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
              style={resumeTextVars(asideHeading, asideText, asideSubtitle)}
            >
              {page === 0 && personalInfo.fieldVisibility.photo ? (
                <Box alignSelf="center" mb={gap}>
                  <ProfileImageEditor size="104px" />
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
