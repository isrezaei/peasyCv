"use client";

import { Box, HStack, VStack } from "@chakra-ui/react";
import { A4Page } from "@/components/resume/canvas/A4Page";
import { ResumeBackground } from "@/components/resume/canvas/ResumeBackground";
import { TemplateSection } from "@/components/resume/sections/TemplateSection";
import { getFontStack } from "@/lib/fonts/registry";
import { getVisibleSections, splitColumns } from "@/lib/resume/sectionLayout";
import { resolveTheme, resumeTextVars } from "@/lib/themes";
import type { RemovableSectionType, TemplateProps } from "@/types";
import { PlainHeader } from "../_shared/PlainHeader";

/** The supporting column holds the summary + secondary sections (قالب ۵). */
const SIDE: ReadonlySet<RemovableSectionType> = new Set([
  "summary",
  "languages",
  "certifications",
]);

export function CompactDuoTemplate({ resume, theme }: TemplateProps) {
  const colors = resolveTheme(theme);
  const backgroundColor = theme.pageBackground === "white" ? "#FFFFFF" : colors.soft;
  const fontStack = getFontStack(theme.fontFamily);
  const { main, side } = splitColumns(getVisibleSections(resume), SIDE);
  const gap = `${theme.sectionSpacing}mm`;

  return (
    <VStack gap="6" align="center" className="resume-pages">
      <A4Page
        pageIndex={0}
        autoHeight
        backgroundColor={backgroundColor}
        paddingMm={theme.pageMargin}
        fontStack={fontStack}
        fontScale={theme.fontScale}
        lineHeight={theme.lineHeight}
        decorations={<ResumeBackground theme={theme} colors={colors} idSuffix="compact-duo" />}
        contentVars={resumeTextVars(colors.secondary, colors.bodyText, colors.subtitle)}
      >
        <VStack align="stretch" gap={gap}>
          <PlainHeader accentColor={colors.accent} divider />
          <HStack align="flex-start" gap="6" dir="rtl">
            <VStack align="stretch" flex="1.5" minW="0" gap={gap}>
              {main.map((section) => (
                <TemplateSection
                  key={section.id}
                  section={section}
                  resume={resume}
                  accent={colors.accent}
                  soft={colors.soft}
                  variant="plain"
                  compact
                />
              ))}
            </VStack>
            <Box width="1px" alignSelf="stretch" bg="border" />
            <VStack align="stretch" flex="1" minW="0" gap={gap}>
              {side.map((section) => (
                <TemplateSection
                  key={section.id}
                  section={section}
                  resume={resume}
                  accent={colors.accent}
                  soft={colors.soft}
                  variant="plain"
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
