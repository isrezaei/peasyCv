"use client";

import { HStack, VStack } from "@chakra-ui/react";
import { A4Page } from "@/components/resume/canvas/A4Page";
import { ResumeBackground } from "@/components/resume/canvas/ResumeBackground";
import { TemplateSection } from "@/components/resume/sections/TemplateSection";
import { getFontStack } from "@/lib/fonts/registry";
import { getVisibleSections, splitColumns } from "@/lib/resume/sectionLayout";
import { darken, resolveTheme, resumeTextVars } from "@/lib/themes";
import type { RemovableSectionType, TemplateProps } from "@/types";
import { HeaderBand } from "../_shared/HeaderBand";

/** The narrower column carries the summary + supporting sections (قالب ۴). */
const SIDE: ReadonlySet<RemovableSectionType> = new Set([
  "summary",
  "languages",
  "certifications",
]);

export function HeaderBandTemplate({ resume, theme }: TemplateProps) {
  const colors = resolveTheme(theme);
  const mainBg = theme.pageBackground === "white" ? "#FFFFFF" : colors.soft;
  const fontStack = getFontStack(theme.fontFamily);
  const { main, side } = splitColumns(getVisibleSections(resume), SIDE);
  const gap = `${theme.sectionSpacing}mm`;
  const pad = `${theme.pageMargin}mm`;
  const bandColor = darken(colors.accent, 0.28);

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
        decorations={<ResumeBackground theme={theme} colors={colors} idSuffix="header-band" />}
        contentVars={resumeTextVars(colors.secondary, colors.bodyText, colors.subtitle)}
      >
        <VStack align="stretch" gap="0">
          <HeaderBand bandColor={bandColor} contrastText={colors.contrastText} padMm={theme.pageMargin} />

          <HStack align="flex-start" gap="8mm" padding={pad} dir="rtl">
            <VStack align="stretch" flex="1.5" minW="0" gap={gap}>
              {main.map((section) => (
                <TemplateSection
                  key={section.id}
                  section={section}
                  resume={resume}
                  accent={colors.accent}
                  soft={colors.soft}
                  variant="solidUnderline"
                  compact
                />
              ))}
            </VStack>
            <VStack align="stretch" flex="1" minW="0" gap={gap}>
              {side.map((section) => (
                <TemplateSection
                  key={section.id}
                  section={section}
                  resume={resume}
                  accent={colors.accent}
                  soft={colors.soft}
                  variant="solidUnderline"
                  compact
                />
              ))}
            </VStack>
          </HStack>
        </VStack>
      </A4Page>
    </VStack>
  );
}
