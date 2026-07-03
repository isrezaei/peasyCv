import { Box } from "@chakra-ui/react";
import type { TemplateId } from "@/types";

interface TemplateThumbnailProps {
  templateId: TemplateId;
  accent: string;
  soft: string;
}

const bar = (w: string, c: string) => <Box height="2px" width={w} bg={c} borderRadius="full" />;

const dot = (c: string, size = "12px") => (
  <Box width={size} height={size} borderRadius="full" bg={c} opacity="0.55" />
);

const Lines = ({ c, ws }: { c: string; ws: string[] }) => (
  <>{ws.map((w, i) => <Box key={i} height="2px" width={w} bg={c} borderRadius="full" />)}</>
);

/** Lightweight static preview of each template layout for the picker grid. */
export function TemplateThumbnail({ templateId, accent, soft }: TemplateThumbnailProps) {
  if (templateId === "double-column") {
    return (
      <Box position="absolute" inset="0" p="2" bg="white">
        {bar("60%", accent)}
        <Box display="flex" gap="1.5" mt="1.5" height="calc(100% - 12px)">
          <Box flex="1.6" display="flex" flexDirection="column" gap="1">
            <Lines c={soft} ws={["90%", "80%", "85%"]} />
          </Box>
          <Box flex="1" display="flex" flexDirection="column" gap="1">
            <Lines c={soft} ws={["70%", "60%"]} />
          </Box>
        </Box>
      </Box>
    );
  }

  if (templateId === "sidebar-column" || templateId === "aside-photo") {
    return (
      <Box position="absolute" inset="0" display="flex" bg="white">
        <Box width="36%" bg={soft} p="1.5" display="flex" flexDirection="column" gap="1" alignItems="stretch">
          <Box alignSelf="center">{dot(accent)}</Box>
          <Lines c={accent} ws={["80%", "70%"]} />
        </Box>
        <Box flex="1" p="1.5" display="flex" flexDirection="column" gap="1">
          <Lines c={accent} ws={["60%"]} />
          <Lines c={soft} ws={["90%", "85%"]} />
        </Box>
      </Box>
    );
  }

  if (templateId === "aside-dark") {
    return (
      <Box position="absolute" inset="0" display="flex" bg="white">
        <Box flex="1" p="1.5" display="flex" flexDirection="column" gap="1">
          <Lines c={accent} ws={["55%"]} />
          <Lines c={soft} ws={["90%", "85%", "80%"]} />
        </Box>
        <Box width="36%" bg={accent} p="1.5" display="flex" flexDirection="column" gap="1">
          <Box alignSelf="center">{dot("white")}</Box>
          <Lines c="rgba(255,255,255,0.7)" ws={["80%", "70%"]} />
        </Box>
      </Box>
    );
  }

  if (templateId === "header-band") {
    return (
      <Box position="absolute" inset="0" bg="white" display="flex" flexDirection="column">
        <Box bg={accent} p="1.5">{bar("60%", "rgba(255,255,255,0.8)")}</Box>
        <Box display="flex" gap="1.5" p="1.5" flex="1">
          <Box flex="1.4" display="flex" flexDirection="column" gap="1"><Lines c={soft} ws={["90%", "80%"]} /></Box>
          <Box flex="1" display="flex" flexDirection="column" gap="1"><Lines c={soft} ws={["70%", "60%"]} /></Box>
        </Box>
      </Box>
    );
  }

  if (templateId === "timeline-panel") {
    return (
      <Box position="absolute" inset="0" bg="white" display="flex" flexDirection="column">
        <Box p="1.5" borderBottomWidth="1px" borderColor="blackAlpha.200">{bar("55%", accent)}</Box>
        <Box display="flex" flex="1">
          <Box flex="1" p="1.5" display="flex" flexDirection="column" gap="1"><Lines c={soft} ws={["85%", "80%"]} /></Box>
          <Box width="38%" bg={soft} p="1.5" display="flex" flexDirection="column" gap="1"><Lines c={accent} ws={["70%", "60%"]} /></Box>
        </Box>
      </Box>
    );
  }

  if (templateId === "compact-duo") {
    return (
      <Box position="absolute" inset="0" p="2" bg="white">
        {bar("60%", accent)}
        <Box display="flex" gap="2" mt="1.5" height="calc(100% - 12px)">
          <Box flex="1.5" display="flex" flexDirection="column" gap="1"><Lines c={soft} ws={["90%", "85%", "80%"]} /></Box>
          <Box width="1px" bg="blackAlpha.200" />
          <Box flex="1" display="flex" flexDirection="column" gap="1"><Lines c={soft} ws={["70%", "60%"]} /></Box>
        </Box>
      </Box>
    );
  }

  if (templateId === "classic-centered") {
    return (
      <Box position="absolute" inset="0" p="2" bg="white" display="flex" flexDirection="column" gap="1.5" alignItems="center">
        <Box alignSelf="center">{bar("50%", accent)}</Box>
        <Box width="20%" height="2px" bg={accent} opacity="0.5" borderRadius="full" />
        <Box width="100%" display="flex" flexDirection="column" gap="1" alignItems="center">
          <Lines c={soft} ws={["88%", "82%", "85%"]} />
        </Box>
      </Box>
    );
  }

  // professional-single-column + ruled-single — single column of rules.
  return (
    <Box position="absolute" inset="0" p="2" bg="white" display="flex" flexDirection="column" gap="1">
      {bar("55%", accent)}
      <Lines c={soft} ws={["100%", "95%", "90%", "92%"]} />
    </Box>
  );
}
