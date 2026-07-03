"use client";

import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { A4Page } from "@/components/resume/canvas/A4Page";
import { ColumnBody, type ColumnSectionRun } from "@/components/resume/canvas/ColumnBody";
import { ResumeBackground } from "@/components/resume/canvas/ResumeBackground";
import { PersonalInfoContacts } from "@/components/resume/editor/PersonalInfoContacts";
import { PersonalInfoIdentity } from "@/components/resume/editor/PersonalInfoIdentity";
import { ProfileImageEditor } from "@/components/resume/editor/ProfileImageEditor";
import { SectionColumnItem } from "@/components/resume/sections/SectionColumnItem";
import { useResumeDocument } from "@/hooks/store/useResumeDocument";
import { type ColumnTemplateLayout, useColumnLayout } from "@/hooks/resume/useColumnLayout";
import { getFontStack } from "@/lib/fonts/registry";
import { t } from "@/lib/i18n";
import { PAGE_MARGIN_MM, SIDE_COLUMN_PAD_FACTOR } from "@/lib/pagination";
import { darken, mixWithWhite, resolveTheme, resumeTextVars, tintColor } from "@/lib/themes";
import type { RemovableSectionType, TemplateProps } from "@/types";

const LAYOUT: ColumnTemplateLayout = {
  sideTypes: new Set<RemovableSectionType>(["projects", "languages", "certifications"]),
  sideWidthMm: 64,
  header: {
    kind: "split",
    main: { identity: true },
    side: { photo: true, photoSizePx: 96, contacts: true, contactsPerRow: 1, layout: "stack" },
  },
};

export function SidebarColumnTemplate({ resume, theme }: TemplateProps) {
  const personalInfo = useResumeDocument().personalInfo;
  const colors = resolveTheme(theme);
  const mainBg = theme.pageBackground === "white" ? "#FFFFFF" : colors.soft;
  const fontStack = getFontStack(theme.fontFamily);
  const gap = `${theme.sectionSpacing}mm`;
  // Vertical margin is the fixed 16mm page margin (equal top/bottom on every page);
  // the horizontal inset follows the slider, tighter still inside the coloured aside.
  const padY = `${PAGE_MARGIN_MM}mm`;
  const padX = `${theme.pageMargin}mm`;
  const sidePadX = `${(theme.pageMargin * SIDE_COLUMN_PAD_FACTOR).toFixed(1)}mm`;
  const nameGap = `${(theme.sectionSpacing * 0.5).toFixed(1)}mm`;
  const pages = useColumnLayout(resume, LAYOUT);

  const sidebarBg = tintColor(colors.base, 0.45, theme.columnIntensity);
  const sidebarHeading = colors.accent;
  const sidebarText = darken(colors.accent, 0.3);
  const sidebarChip = mixWithWhite(colors.accent, 0.84);

  const renderSide = ({ section, itemIds, showTitle }: ColumnSectionRun) => (
    <SectionColumnItem
      section={section}
      resume={resume}
      accent={sidebarText}
      soft={sidebarChip}
      titleColor={sidebarHeading}
      showRule
      itemIds={itemIds}
      showTitle={showTitle}
    />
  );
  const renderMain = ({ section, itemIds, showTitle }: ColumnSectionRun) => (
    <SectionColumnItem
      section={section}
      resume={resume}
      accent={colors.accent}
      soft={colors.soft}
      showRule
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
          decorations={<ResumeBackground theme={theme} colors={colors} idSuffix={`sc-p${page}`} />}
          contentVars={resumeTextVars(colors.secondary, colors.bodyText, colors.subtitle)}
        >
          <HStack align="stretch" gap="0" minH="inherit">
            <VStack
              align="stretch"
              width="64mm"
              flexShrink={0}
              bg={sidebarBg}
              color={sidebarText}
              paddingBlock={padY}
              paddingInline={sidePadX}
              gap="0"
              dir="rtl"
              style={resumeTextVars(sidebarHeading, sidebarText, sidebarHeading)}
            >
              {page === 0 ? (
                <VStack align="stretch" gap={gap} mb={gap}>
                  {personalInfo.fieldVisibility.photo ? (
                    <Box alignSelf="center">
                      <ProfileImageEditor size="96px" />
                    </Box>
                  ) : null}
                  <PersonalInfoContacts accentColor={sidebarHeading} color={sidebarText} />
                </VStack>
              ) : null}
              <ColumnBody blocks={pages.side[page] ?? []} sections={resume.sections} renderSection={renderSide} />
              <Box flex="1" />
              {page === pages.pageCount - 1 ? (
                <Text fontSize="2xs" color={sidebarHeading} opacity="0.7" textAlign="center" mt={gap}>
                  {t.app.title}
                </Text>
              ) : null}
            </VStack>

            <VStack align="stretch" flex="1" minW="0" paddingBlock={padY} paddingInline={padX} gap="0" dir="rtl">
              {page === 0 ? (
                <Box flexShrink={0} mb={nameGap}>
                  <PersonalInfoIdentity accentColor={colors.accent} />
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
