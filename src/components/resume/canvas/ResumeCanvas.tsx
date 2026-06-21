"use client";

import { Box, Center, Spinner } from "@chakra-ui/react";
import { getTemplate } from "@/components/resume/templates/registry";
import { RightRail } from "@/components/layout/RightRail";
import { useResumeDocument } from "@/hooks/store/useResumeDocument";
import { useSaveStatus } from "@/hooks/store/useSaveStatus";

export function ResumeCanvas() {
  const resume = useResumeDocument();
  const { isHydrated } = useSaveStatus();

  if (!isHydrated) {
    return (
      <Center height="100%" bg="#f4f4f5">
        <Spinner size="lg" color="accent.solid" />
      </Center>
    );
  }

  const template = getTemplate(resume.templateId);
  const Template = template.component;

  return (
    <Box height="100%" overflowY="auto" bg="#f4f4f5">
      <RightRail />
      {/* Asymmetric padding keeps the centred page clear of the floating action
          rail on the inline-end side, mirroring the design's offset layout. */}
      <Box pt="32px" pb="64px" paddingInlineEnd="72px" paddingInlineStart="24px">
        <Template resume={resume} theme={resume.theme} />
      </Box>
    </Box>
  );
}
