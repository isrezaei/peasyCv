"use client";

import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { A4Page } from "@/components/resume/canvas/A4Page";
import { ResumeBackground } from "@/components/resume/canvas/ResumeBackground";
import { PersonalInfoContacts } from "@/components/resume/editor/PersonalInfoContacts";
import { PersonalInfoIdentity } from "@/components/resume/editor/PersonalInfoIdentity";
import { ProfileImageEditor } from "@/components/resume/editor/ProfileImageEditor";
import { SectionColumnItem } from "@/components/resume/sections/SectionColumnItem";
import { useResumeDocument } from "@/hooks/store/useResumeDocument";
import { getFontStack } from "@/lib/fonts/registry";
import { t } from "@/lib/i18n";
import { getVisibleSections, splitColumns } from "@/lib/resume/sectionLayout";
import { darken, mixWithWhite, resolveTheme } from "@/lib/themes";
import type { TemplateProps } from "@/types";

export function SidebarColumnTemplate({ resume, theme }: TemplateProps) {
  const personalInfo = useResumeDocument().personalInfo;
  const colors = resolveTheme(theme);
  const mainBg = theme.pageBackground === "white" ? "#FFFFFF" : colors.soft;
  const fontStack = getFontStack(theme.fontFamily);
  const { main, side } = splitColumns(getVisibleSections(resume));
  const gap = `${theme.sectionSpacing}mm`;
  const pad = `${theme.pageMargin}mm`;

  // A soft, refined colored sidebar: a light pastel fill with dark, readable text
  // and accent headings, rather than a heavy saturated block of white-on-dark.
  // Lightened per the 2026 reference so the column reads as a gentle tint.
  const sidebarBg = mixWithWhite(colors.base, 0.45);
  const sidebarHeading = colors.accent;
  const sidebarText = darken(colors.accent, 0.3);
  const sidebarChip = mixWithWhite(colors.accent, 0.84);

  return (
    <VStack gap="6" align="center" className="resume-pages">
      <A4Page
        pageIndex={0}
        autoHeight
        bleed
        backgroundColor={mainBg}
        fontStack={fontStack}
        fontScale={theme.fontScale}
        lineHeight={theme.lineHeight}
        decorations={<ResumeBackground theme={theme} colors={colors} idSuffix="sc" />}
      >
        <HStack align="stretch" gap="0" minH="inherit">
          {/* Colored sidebar */}
          <VStack
            align="stretch"
            width="64mm"
            flexShrink={0}
            bg={sidebarBg}
            color={sidebarText}
            padding={pad}
            gap={gap}
            dir="rtl"
          >
            {personalInfo.fieldVisibility.photo ? (
              <Box alignSelf="center">
                <ProfileImageEditor size="96px" />
              </Box>
            ) : null}
            <PersonalInfoContacts accentColor={sidebarHeading} color={sidebarText} />
            {side.map((section) => (
              <SectionColumnItem
                key={section.id}
                section={section}
                resume={resume}
                accent={sidebarText}
                soft={sidebarChip}
                titleColor={sidebarHeading}
                showRule
              />
            ))}
            <Box flex="1" />
            <Text fontSize="2xs" color={sidebarHeading} opacity="0.7" textAlign="center">
              {t.app.title}
            </Text>
          </VStack>

          {/* Main column */}
          <VStack align="stretch" flex="1" minW="0" padding={pad} gap={gap} dir="rtl">
            <PersonalInfoIdentity accentColor={colors.accent} />
            {main.map((section) => (
              <SectionColumnItem
                key={section.id}
                section={section}
                resume={resume}
                accent={colors.accent}
                soft={colors.soft}
                showRule
              />
            ))}
          </VStack>
        </HStack>
      </A4Page>
    </VStack>
  );
}
