"use client";

import { Box, Center, Spinner } from "@chakra-ui/react";
import { getTemplate } from "@/components/resume/templates/registry";
import { RightRail } from "@/components/layout/RightRail";
import { useResumeDocument } from "@/hooks/store/useResumeDocument";
import { useSaveStatus } from "@/hooks/store/useSaveStatus";
import { useSidebar } from "@/hooks/store/useSidebar";

export function ResumeCanvas() {
  const resume = useResumeDocument();
  const { isHydrated } = useSaveStatus();
  const { collapsed } = useSidebar();

  if (!isHydrated) {
    return (
      <Center height="100%" bg="white">
        <Spinner size="lg" color="accent.solid" />
      </Center>
    );
  }

  const template = getTemplate(resume.templateId);
  const Template = template.component;

  return (
    // FIXED page-holder: a static white frame that never scrolls itself
    // (`overflow:hidden`), so no stray scrollbar leaks onto the workspace. The
    // RightRail and sidebar overlay anchor to it.
    <Box position="relative" height="100%" overflow="hidden" bg="white">
      <RightRail />
      {/* Inner scroller: the ONE element that scrolls the pages, vertically only.
          `paddingInlineStart` is responsive to the side panel — when the panel is
          OPEN it overlays the page on narrow viewports (base), but from `xl` up it
          steps the padding past the 312px panel so the centred A4 page stays fully
          visible and never sits under the overlay. The inline-end padding keeps the
          page clear of the floating action rail. */}
      <Box
        height="100%"
        overflowY="auto"
        overflowX="hidden"
        pt="32px"
        pb="64px"
        paddingInlineEnd="72px"
        paddingInlineStart={collapsed ? "24px" : { base: "24px", xl: "400px", "2xl": "432px" }}
        transition="padding-inline-start 0.28s cubic-bezier(0.4, 0, 0.2, 1)"
      >
        <Template resume={resume} theme={resume.theme} />
      </Box>
    </Box>
  );
}
