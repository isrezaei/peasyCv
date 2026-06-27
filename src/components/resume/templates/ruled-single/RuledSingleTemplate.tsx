"use client";

import { VStack } from "@chakra-ui/react";
import { A4Page } from "@/components/resume/canvas/A4Page";
import { ResumeBackground } from "@/components/resume/canvas/ResumeBackground";
import { TemplateSection } from "@/components/resume/sections/TemplateSection";
import { getFontStack } from "@/lib/fonts/registry";
import { getVisibleSections } from "@/lib/resume/sectionLayout";
import { resolveTheme, resumeTextVars } from "@/lib/themes";
import type { TemplateProps } from "@/types";
import { PlainHeader } from "../_shared/PlainHeader";

/** Single column with strong ruled headings (قالب ۶). */
export function RuledSingleTemplate({ resume, theme }: TemplateProps) {
  const colors = resolveTheme(theme);
  const backgroundColor = theme.pageBackground === "white" ? "#FFFFFF" : colors.soft;
  const fontStack = getFontStack(theme.fontFamily);
  const sections = getVisibleSections(resume);
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
        decorations={<ResumeBackground theme={theme} colors={colors} idSuffix="ruled-single" />}
        contentVars={resumeTextVars(colors.secondary, colors.bodyText, colors.subtitle)}
      >
        <VStack align="stretch" gap={gap}>
          <PlainHeader accentColor={colors.accent} />
          {sections.map((section) => (
            <TemplateSection
              key={section.id}
              section={section}
              resume={resume}
              accent={colors.accent}
              soft={colors.soft}
              variant="solidUnderline"
            />
          ))}
        </VStack>
      </A4Page>
    </VStack>
  );
}
