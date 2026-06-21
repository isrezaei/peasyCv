"use client";

import { useMemo } from "react";
import { Box, VStack } from "@chakra-ui/react";
import { A4Page } from "@/components/resume/canvas/A4Page";
import { BlockRenderer } from "@/components/resume/canvas/BlockRenderer";
import { ResumeBackground } from "@/components/resume/canvas/ResumeBackground";
import { useResumeLayout } from "@/hooks/resume/useResumeLayout";
import { getFontStack } from "@/lib/fonts/registry";
import { resolveTheme } from "@/lib/themes";
import type { TemplateProps } from "@/types";

export function ProfessionalTemplate({ resume, theme }: TemplateProps) {
  const pages = useResumeLayout(resume);

  // Derived presentation values change only with the theme, never on content
  // edits, so memoizing them keeps the strings fed to memoized blocks stable.
  const colors = useMemo(() => resolveTheme(theme), [theme]);
  const fontStack = useMemo(() => getFontStack(theme.fontFamily), [theme.fontFamily]);
  const backgroundColor = theme.pageBackground === "white" ? "#FFFFFF" : colors.soft;

  return (
    <VStack gap="6" align="center" className="resume-pages">
      {pages.map((page) => (
        <A4Page
          key={page.pageIndex}
          pageIndex={page.pageIndex}
          backgroundColor={backgroundColor}
          paddingMm={theme.pageMargin}
          fontStack={fontStack}
          fontScale={theme.fontScale}
          lineHeight={theme.lineHeight}
          decorations={
            <ResumeBackground theme={theme} colors={colors} idSuffix={`p${page.pageIndex}`} />
          }
        >
          <Box>
            {page.blocks.map((block, index) => (
              <Box
                key={block.id}
                data-block-id={block.id}
                data-block-kind={block.kind}
                mt={index === 0 ? 0 : `${block.gapBeforeMm}mm`}
              >
                <BlockRenderer
                  block={block}
                  resume={resume}
                  accent={colors.accent}
                  soft={colors.soft}
                />
              </Box>
            ))}
          </Box>
        </A4Page>
      ))}
    </VStack>
  );
}
