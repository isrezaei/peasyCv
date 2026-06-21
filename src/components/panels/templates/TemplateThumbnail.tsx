import { Box } from "@chakra-ui/react";
import type { TemplateId } from "@/types";

interface TemplateThumbnailProps {
  templateId: TemplateId;
  accent: string;
  soft: string;
}

const bar = (w: string, c: string) => (
  <Box height="2px" width={w} bg={c} borderRadius="full" />
);

/** Lightweight static preview of each template layout for the picker grid. */
export function TemplateThumbnail({ templateId, accent, soft }: TemplateThumbnailProps) {
  if (templateId === "double-column") {
    return (
      <Box position="absolute" inset="0" p="2" bg="white">
        {bar("60%", accent)}
        <Box display="flex" gap="1.5" mt="1.5" height="calc(100% - 12px)">
          <Box flex="1.6" display="flex" flexDirection="column" gap="1">
            {bar("90%", soft)}
            {bar("80%", soft)}
            {bar("85%", soft)}
          </Box>
          <Box flex="1" display="flex" flexDirection="column" gap="1">
            {bar("70%", soft)}
            {bar("60%", soft)}
          </Box>
        </Box>
      </Box>
    );
  }

  if (templateId === "sidebar-column") {
    // Mirror the redesigned template: a soft pastel sidebar (not a heavy block)
    // with accent-coloured marks, so the picker preview matches the real output.
    return (
      <Box position="absolute" inset="0" display="flex" bg="white">
        <Box width="36%" bg={soft} p="1.5" display="flex" flexDirection="column" gap="1">
          <Box width="14px" height="14px" borderRadius="full" bg={accent} opacity="0.5" alignSelf="center" />
          {bar("80%", accent)}
          {bar("70%", accent)}
        </Box>
        <Box flex="1" p="1.5" display="flex" flexDirection="column" gap="1">
          {bar("60%", accent)}
          {bar("90%", soft)}
          {bar("85%", soft)}
        </Box>
      </Box>
    );
  }

  return (
    <Box position="absolute" inset="0" p="2" bg="white" display="flex" flexDirection="column" gap="1">
      {bar("55%", accent)}
      {bar("100%", soft)}
      {bar("95%", soft)}
      {bar("90%", soft)}
      {bar("92%", soft)}
    </Box>
  );
}
