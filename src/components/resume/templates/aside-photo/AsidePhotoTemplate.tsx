"use client";

import { Box, HStack, VStack } from "@chakra-ui/react";
import { A4Page } from "@/components/resume/canvas/A4Page";
import { ResumeBackground } from "@/components/resume/canvas/ResumeBackground";
import { PersonalInfoContacts } from "@/components/resume/editor/PersonalInfoContacts";
import { ProfileImageEditor } from "@/components/resume/editor/ProfileImageEditor";
import { TemplateSection } from "@/components/resume/sections/TemplateSection";
import { useResumeDocument } from "@/hooks/store/useResumeDocument";
import { getFontStack } from "@/lib/fonts/registry";
import { getVisibleSections, splitColumns } from "@/lib/resume/sectionLayout";
import { darken, mixWithWhite, resolveTheme, resumeTextVars, tintColor } from "@/lib/themes";
import type { RemovableSectionType, TemplateProps } from "@/types";
import { PlainHeader } from "../_shared/PlainHeader";

/** Supporting sections that sit in the tinted photo aside (قالب ۲). */
const SIDE: ReadonlySet<RemovableSectionType> = new Set([
  "projects",
  "languages",
  "certifications",
]);

export function AsidePhotoTemplate({ resume, theme }: TemplateProps) {
  const personalInfo = useResumeDocument().personalInfo;
  const colors = resolveTheme(theme);
  const mainBg = theme.pageBackground === "white" ? "#FFFFFF" : colors.soft;
  const fontStack = getFontStack(theme.fontFamily);
  const { main, side } = splitColumns(getVisibleSections(resume), SIDE);
  const gap = `${theme.sectionSpacing}mm`;
  const pad = `${theme.pageMargin}mm`;
  // Tighter inner padding for the photo aside so its content isn't cramped.
  const sidePad = `${(theme.pageMargin * 0.66).toFixed(1)}mm`;

  // A gentle tint of the theme base for the aside (scaled by the user's column
  // intensity — 50% white at intensity 1, the original look), with accent headings
  // and a soft accent wash behind the icon chips — the design's defining motif.
  const asideBg = tintColor(colors.base, 0.5, theme.columnIntensity);
  const asideHeading = colors.accent;
  const asideText = darken(colors.accent, 0.3);
  const asideChip = mixWithWhite(colors.accent, 0.84);
  const mainChip = mixWithWhite(colors.accent, 0.86);

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
        decorations={<ResumeBackground theme={theme} colors={colors} idSuffix="aside-photo" />}
        contentVars={resumeTextVars(colors.secondary, colors.bodyText, colors.subtitle)}
      >
        <HStack align="stretch" gap="0" minH="inherit">
          {/* Tinted photo aside (leading side in RTL) */}
          <VStack
            align="stretch"
            width="68mm"
            flexShrink={0}
            bg={asideBg}
            color={asideText}
            padding={sidePad}
            gap={gap}
            dir="rtl"
            style={resumeTextVars(asideHeading, asideText, asideHeading)}
          >
            {personalInfo.fieldVisibility.photo ? (
              <Box alignSelf="center">
                <ProfileImageEditor size="120px" />
              </Box>
            ) : null}
            <PersonalInfoContacts accentColor={asideHeading} color={asideText} />
            {side.map((section) => (
              <TemplateSection
                key={section.id}
                section={section}
                resume={resume}
                accent={asideText}
                soft={asideChip}
                titleColor={asideHeading}
                variant="chip"
                chipColor={asideChip}
                compact
              />
            ))}
          </VStack>

          {/* Main column */}
          <VStack align="stretch" flex="1" minW="0" padding={pad} gap={gap} dir="rtl">
            <PlainHeader accentColor={colors.accent} showPhoto={false} showContacts={false} divider />
            {main.map((section) => (
              <TemplateSection
                key={section.id}
                section={section}
                resume={resume}
                accent={colors.accent}
                soft={colors.soft}
                variant="chip"
                chipColor={mainChip}
                compact
              />
            ))}
          </VStack>
        </HStack>
      </A4Page>
    </VStack>
  );
}
