"use client";

import { Box, HStack, VStack } from "@chakra-ui/react";
import { A4Page } from "@/components/resume/canvas/A4Page";
import { ColumnBody, type ColumnSectionRun } from "@/components/resume/canvas/ColumnBody";
import { ResumeBackground } from "@/components/resume/canvas/ResumeBackground";
import { PersonalInfoContacts } from "@/components/resume/editor/PersonalInfoContacts";
import { ProfileImageEditor } from "@/components/resume/editor/ProfileImageEditor";
import { TemplateSection } from "@/components/resume/sections/TemplateSection";
import { useResumeDocument } from "@/hooks/store/useResumeDocument";
import { type ColumnTemplateLayout, useColumnLayout } from "@/hooks/resume/useColumnLayout";
import { getFontStack } from "@/lib/fonts/registry";
import { PAGE_MARGIN_MM, SIDE_COLUMN_PAD_FACTOR } from "@/lib/pagination";
import { darken, mixWithWhite, resolveTheme, resumeTextVars, tintColor } from "@/lib/themes";
import type { RemovableSectionType, TemplateProps } from "@/types";
import { PlainHeader } from "../_shared/PlainHeader";

/** Supporting sections that sit in the tinted photo aside (قالب ۲). */
const LAYOUT: ColumnTemplateLayout = {
  sideTypes: new Set<RemovableSectionType>(["projects", "languages", "certifications"]),
  sideWidthMm: 68,
  header: {
    kind: "split",
    main: { identity: true, extraPx: 18 },
    side: { photo: true, photoSizePx: 120, contacts: true, contactsPerRow: 1, layout: "stack" },
  },
};

export function AsidePhotoTemplate({ resume, theme }: TemplateProps) {
  const personalInfo = useResumeDocument().personalInfo;
  const colors = resolveTheme(theme);
  const mainBg = theme.pageBackground === "white" ? "#FFFFFF" : colors.soft;
  const fontStack = getFontStack(theme.fontFamily);
  const gap = `${theme.sectionSpacing}mm`;
  // Fixed 16mm vertical margin (equal top/bottom); horizontal follows the slider,
  // tighter inside the photo aside.
  const padY = `${PAGE_MARGIN_MM}mm`;
  const padX = `${theme.pageMargin}mm`;
  const sidePadX = `${(theme.pageMargin * SIDE_COLUMN_PAD_FACTOR).toFixed(1)}mm`;
  const pages = useColumnLayout(resume, LAYOUT);

  const asideBg = tintColor(colors.base, 0.5, theme.columnIntensity);
  const asideHeading = colors.accent;
  const asideText = darken(colors.accent, 0.3);
  const asideChip = mixWithWhite(colors.accent, 0.84);
  const mainChip = mixWithWhite(colors.accent, 0.86);

  const renderSide = ({ section, itemIds, showTitle }: ColumnSectionRun) => (
    <TemplateSection
      section={section}
      resume={resume}
      accent={asideText}
      soft={asideChip}
      titleColor={asideHeading}
      variant="chip"
      chipColor={asideChip}
      compact
      itemIds={itemIds}
      showTitle={showTitle}
    />
  );
  const renderMain = ({ section, itemIds, showTitle }: ColumnSectionRun) => (
    <TemplateSection
      section={section}
      resume={resume}
      accent={colors.accent}
      soft={colors.soft}
      variant="chip"
      chipColor={mainChip}
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
          decorations={<ResumeBackground theme={theme} colors={colors} idSuffix={`aside-photo-p${page}`} />}
          contentVars={resumeTextVars(colors.secondary, colors.bodyText, colors.subtitle)}
        >
          <HStack align="stretch" gap="0" minH="inherit">
            <VStack
              align="stretch"
              width="68mm"
              flexShrink={0}
              bg={asideBg}
              color={asideText}
              paddingBlock={padY}
              paddingInline={sidePadX}
              gap="0"
              dir="rtl"
              style={resumeTextVars(asideHeading, asideText, asideHeading)}
            >
              {page === 0 ? (
                <VStack align="stretch" gap={gap} mb={gap}>
                  {personalInfo.fieldVisibility.photo ? (
                    <Box alignSelf="center">
                      <ProfileImageEditor size="120px" />
                    </Box>
                  ) : null}
                  <PersonalInfoContacts accentColor={asideHeading} color={asideText} />
                </VStack>
              ) : null}
              <ColumnBody blocks={pages.side[page] ?? []} sections={resume.sections} renderSection={renderSide} />
            </VStack>

            <VStack align="stretch" flex="1" minW="0" paddingBlock={padY} paddingInline={padX} gap="0" dir="rtl">
              {page === 0 ? (
                <Box mb={gap}>
                  <PlainHeader accentColor={colors.accent} showPhoto={false} showContacts={false} divider />
                </Box>
              ) : null}
              <ColumnBody blocks={pages.main[page] ?? []} sections={resume.sections} renderSection={renderMain} />
            </VStack>
          </HStack>
        </A4Page>
      ))}
    </VStack>
  );
}
