import { Box, Text, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { COLORS } from "@/lib/design/tokens";

interface PanelGroupProps {
  label: string;
  /** Optional short helper line shown under the title (small, muted). */
  description?: string;
  children: ReactNode;
}

/**
 * A labelled settings group: a prominent 15px/700 section heading in dark ink,
 * with an optional small muted (semantic `fg.muted`) helper line beneath it that
 * briefly explains the controls in the block.
 */
export function PanelGroup({ label, description, children }: PanelGroupProps) {
  return (
    <Box>
      <Text fontSize="15px" fontWeight="700" letterSpacing="0.01em" my={description ? "3px" : "14px"} style={{ color: COLORS.ink700 }}>
        {label}
      </Text>
      {description ? (
        <Text fontSize="11.5px" lineHeight="1.6" mb="14px" color="fg.muted">
          {description}
        </Text>
      ) : null}
      <VStack align="stretch" gap="3">
        {children}
      </VStack>
    </Box>
  );
}
