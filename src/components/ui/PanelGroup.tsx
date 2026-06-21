import { Box, Text, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { COLORS } from "@/lib/design/tokens";

interface PanelGroupProps {
  label: string;
  children: ReactNode;
}

/** A labelled settings group: 11px/600/0.04em muted heading, matching the design. */
export function PanelGroup({ label, children }: PanelGroupProps) {
  return (
    <Box>
      <Text fontSize="11px" fontWeight="600" letterSpacing="0.04em" mb="14px" style={{ color: COLORS.muted }}>
        {label}
      </Text>
      <VStack align="stretch" gap="3">
        {children}
      </VStack>
    </Box>
  );
}
