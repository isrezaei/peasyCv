"use client";

import { Box, HStack, VStack } from "@chakra-ui/react";
import { A4Page } from "@/components/resume/canvas/A4Page";
import { ResumeBackground } from "@/components/resume/canvas/ResumeBackground";
import { ProfileImageEditor } from "@/components/resume/editor/ProfileImageEditor";
import { TemplateSection } from "@/components/resume/sections/TemplateSection";
import { useResumeDocument } from "@/hooks/store/useResumeDocument";
import { getFontStack } from "@/lib/fonts/registry";
import { getVisibleSections, splitColumns } from "@/lib/resume/sectionLayout";
import { mixWithWhite, resolveTheme, resumeTextVars, shadeColor } from "@/lib/themes";
import type { RemovableSectionType, TemplateProps } from "@/types";
import { PlainHeader } from "../_shared/PlainHeader";

/** The dark aside carries the photo plus the supporting sections (قالب ۱). */
const SIDE: ReadonlySet<RemovableSectionType> = new Set([
  "skills",
  "projects",
  "languages",
  "certifications",
]);

export function AsideDarkTemplate({ resume, theme }: TemplateProps) {
  const personalInfo = useResumeDocument().personalInfo;
  const colors = resolveTheme(theme);
  const mainBg = theme.pageBackground === "white" ? "#FFFFFF" : colors.soft;
  const fontStack = getFontStack(theme.fontFamily);
  const { main, side } = splitColumns(getVisibleSections(resume), SIDE);
  const gap = `${theme.sectionSpacing}mm`;
  const pad = `${theme.pageMargin}mm`;
  // Tighter inner padding for the dark aside so its content isn't cramped.
  const sidePad = `${(theme.pageMargin * 0.66).toFixed(1)}mm`;

  // A deep tint of the theme accent — so the user's colour still drives the
  // column — with light text tiers and a lightened accent for the marks (dots,
  // rails, language meters) the section content paints. The darkness is scaled by
  // the user's column intensity (50% at intensity 1 — the original look).
  const asideBg = shadeColor(colors.accent, 0.5, theme.columnIntensity);
  const asideHeading = "#FFFFFF";
  const asideText = "rgba(255,255,255,0.80)";
  const asideSubtitle = "rgba(255,255,255,0.88)";
  const asideAccent = mixWithWhite(colors.accent, 0.55);
  const asideChip = "rgba(255,255,255,0.12)";

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
        decorations={<ResumeBackground theme={theme} colors={colors} idSuffix="aside-dark" />}
        contentVars={resumeTextVars(colors.secondary, colors.bodyText, colors.subtitle)}
      >
        <HStack align="stretch" gap="0" minH="inherit">
          {/* Main column — identity + contacts live here; the photo sits in the aside. */}
          <VStack align="stretch" flex="1" minW="0" padding={pad} gap={gap} dir="rtl">
            <PlainHeader accentColor={colors.accent} showPhoto={false} />
            {main.map((section) => (
              <TemplateSection
                key={section.id}
                section={section}
                resume={resume}
                accent={colors.accent}
                soft={colors.soft}
                variant="underline"
                compact
              />
            ))}
          </VStack>

          {/* Dark aside */}
          <VStack
            align="stretch"
            width="72mm"
            flexShrink={0}
            bg={asideBg}
            color={asideText}
            padding={sidePad}
            gap={gap}
            dir="rtl"
            style={resumeTextVars(asideHeading, asideText, asideSubtitle)}
          >
            {personalInfo.fieldVisibility.photo ? (
              <Box alignSelf="center">
                <ProfileImageEditor size="104px" />
              </Box>
            ) : null}
            {side.map((section) => (
              <TemplateSection
                key={section.id}
                section={section}
                resume={resume}
                accent={asideAccent}
                soft={asideChip}
                titleColor={asideHeading}
                variant="underline"
                tone="onDark"
                compact
              />
            ))}
          </VStack>
        </HStack>
      </A4Page>
    </VStack>
  );
}
