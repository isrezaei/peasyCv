"use client";

import { Box, Center, Spinner } from "@chakra-ui/react";
import { EmptyHighlightProvider } from "@/components/resume/editor/EmptyHighlightContext";
import { FitToWidth } from "@/components/resume/canvas/FitToWidth";
import { ProfessionalTemplate } from "@/components/resume/templates/professional/ProfessionalTemplate";
import { getTemplate } from "@/components/resume/templates/registry";
import { useResumeDocument } from "@/hooks/store/useResumeDocument";
import { useSaveStatus } from "@/hooks/store/useSaveStatus";
import { useSidebar } from "@/hooks/store/useSidebar";

export function ResumeCanvas() {
  const resume = useResumeDocument();
  const { isHydrated } = useSaveStatus();
  const { collapsed } = useSidebar();

  if (!isHydrated) {
    return (
      <Center height="100%" bg="bg">
        <Spinner size="lg" color="accent.solid" />
      </Center>
    );
  }

  // ATS Friendly mode renders the single-column, decoration-free template in the
  // editor too (still fully editable — the static-text swap is print-only), so the
  // user sees exactly the structure the PDF will carry.
  const Template = resume.theme.atsMode
    ? ProfessionalTemplate
    : getTemplate(resume.templateId).component;

  return (
    // FIXED page-holder: a static workspace frame (app surface colour) that
    // never scrolls itself (`overflow:hidden`), so no stray scrollbar leaks onto
    // the workspace. The sidebar overlay anchors to it.
    <Box position="relative" height="100%" overflow="hidden" bg="bg">
      {/* Inner scroller: the ONE element that scrolls the pages, vertically only.
          Side padding is tight on phones/tablets (the panel is an overlay drawer
          there, so it reserves no width) and steps up on desktop. From `xl` up,
          when the panel is OPEN, the start padding jumps past the inline panel so
          the centred A4 page stays fully visible; on smaller screens the page is
          instead SCALED to fit by FitToWidth, never cropped. */}
      <Box
        height="100%"
        overflowY="auto"
        overflowX="hidden"
        pt={{ base: "12px", md: "24px", xl: "32px" }}
        pb={{ base: "40px", md: "56px", xl: "64px" }}
        paddingInlineEnd={{ base: "10px", md: "16px", xl: "24px" }}
        paddingInlineStart={
          collapsed
            ? { base: "10px", md: "16px", xl: "24px" }
            : { base: "10px", md: "16px", xl: "400px", "2xl": "432px" }
        }
        transition="padding-inline-start 0.28s cubic-bezier(0.4, 0, 0.2, 1)"
      >
        {/* Editor-only: EmptyHighlightProvider surfaces the download-time
            empty-field validation to the fields. /print and /share render the
            same Template without it, so the red highlight is editor-only.
            FitToWidth SCALES the fixed-geometry A4 page to fit narrow viewports
            without changing any pagination input (see FitToWidth). */}
        <EmptyHighlightProvider>
          <FitToWidth>
            <Template resume={resume} theme={resume.theme} />
          </FitToWidth>
        </EmptyHighlightProvider>
      </Box>
    </Box>
  );
}
