"use client";

import { Box, HStack, VStack } from "@chakra-ui/react";
import { A4Page } from "@/components/resume/canvas/A4Page";
import { ResumeBackground } from "@/components/resume/canvas/ResumeBackground";
import { TemplateSection } from "@/components/resume/sections/TemplateSection";
import { getFontStack } from "@/lib/fonts/registry";
import { getVisibleSections, splitColumns } from "@/lib/resume/sectionLayout";
import { mixWithWhite, resolveTheme, resumeTextVars, tintColor } from "@/lib/themes";
import type { RemovableSectionType, TemplateProps } from "@/types";
import { PlainHeader } from "../_shared/PlainHeader";

/**
 * The tinted side panel holds the supporting sections (قالب ۳). The summary
 * («درباره من») lives in the MAIN timeline column, not the panel.
 */
const SIDE: ReadonlySet<RemovableSectionType> = new Set([
  "skills",
  "languages",
  "certifications",
]);

export function TimelinePanelTemplate({ resume, theme }: TemplateProps) {
  const colors = resolveTheme(theme);
  const mainBg = theme.pageBackground === "white" ? "#FFFFFF" : colors.soft;
  const fontStack = getFontStack(theme.fontFamily);
  const { main, side } = splitColumns(getVisibleSections(resume), SIDE);
  const gap = `${theme.sectionSpacing}mm`;
  const pad = `${theme.pageMargin}mm`;
  // Tighter inner padding for the side panel so its content isn't cramped.
  const sidePad = `${(theme.pageMargin * 0.66).toFixed(1)}mm`;

  // The panel tint scales with the user's column intensity (55% white at intensity
  // 1 — the original look).
  const panelBg = tintColor(colors.base, 0.55, theme.columnIntensity);
  const panelHeading = colors.accent;
  const panelText = colors.bodyText;

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
        decorations={<ResumeBackground theme={theme} colors={colors} idSuffix="timeline-panel" />}
        contentVars={resumeTextVars(colors.secondary, colors.bodyText, colors.subtitle)}
      >
        <Box display="flex" flexDirection="column" minH="inherit">
          {/* Full-width header strip */}
          <Box padding={pad} pb="4" borderBottomWidth="1px" borderColor="blackAlpha.200">
            <PlainHeader accentColor={colors.accent} />
          </Box>

          {/* Timeline main + tinted side panel */}
          <HStack align="stretch" flex="1" gap="0">
            <VStack align="stretch" flex="1" minW="0" padding={pad} gap={gap} dir="rtl">
              {main.map((section) => (
                <TemplateSection
                  key={section.id}
                  section={section}
                  resume={resume}
                  accent={colors.accent}
                  soft={colors.soft}
                  variant="bar"
                  compact
                />
              ))}
            </VStack>

            <VStack
              align="stretch"
              width="66mm"
              flexShrink={0}
              bg={panelBg}
              color={panelText}
              padding={sidePad}
              gap={gap}
              dir="rtl"
              style={resumeTextVars(colors.secondary, colors.bodyText, colors.subtitle)}
            >
              {side.map((section) => (
                <TemplateSection
                  key={section.id}
                  section={section}
                  resume={resume}
                  accent={colors.accent}
                  soft={mixWithWhite(colors.accent, 0.84)}
                  titleColor={panelHeading}
                  variant="plain"
                  compact
                />
              ))}
            </VStack>
          </HStack>
        </Box>
      </A4Page>
    </VStack>
  );
}
