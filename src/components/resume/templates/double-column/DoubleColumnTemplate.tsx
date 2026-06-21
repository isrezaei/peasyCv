"use client";

import { Box, HStack, VStack } from "@chakra-ui/react";
import { A4Page } from "@/components/resume/canvas/A4Page";
import { ResumeBackground } from "@/components/resume/canvas/ResumeBackground";
import { PersonalInfoBlock } from "@/components/resume/editor/PersonalInfoBlock";
import { SectionColumnItem } from "@/components/resume/sections/SectionColumnItem";
import { getFontStack } from "@/lib/fonts/registry";
import { getVisibleSections, splitColumns } from "@/lib/resume/sectionLayout";
import { resolveTheme } from "@/lib/themes";
import type { TemplateProps } from "@/types";

export function DoubleColumnTemplate({ resume, theme }: TemplateProps) {
  const colors = resolveTheme(theme);
  const backgroundColor = theme.pageBackground === "white" ? "#FFFFFF" : colors.soft;
  const fontStack = getFontStack(theme.fontFamily);
  const { main, side } = splitColumns(getVisibleSections(resume));
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
        decorations={<ResumeBackground theme={theme} colors={colors} idSuffix="dc" />}
      >
        <VStack align="stretch" gap={gap}>
          <PersonalInfoBlock accentColor={colors.accent} />
          <HStack align="flex-start" gap="6">
            <VStack align="stretch" flex="1.7" minW="0" gap={gap}>
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
            <Box width="1px" alignSelf="stretch" bg="border" />
            <VStack align="stretch" flex="1" minW="0" gap={gap}>
              {side.map((section) => (
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
        </VStack>
      </A4Page>
    </VStack>
  );
}
