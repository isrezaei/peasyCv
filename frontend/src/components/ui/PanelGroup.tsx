import { Stack, Text, VStack } from "@chakra-ui/react";
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
    <Stack gapY={5} my={2}>
      <Stack gapY={1}>
        <Text
          p={0}
          m={0}
          fontSize="sm"
          fontWeight="700"
          style={{ color: COLORS.ink700 }}
        >
          {label}
        </Text>
        {description ? (
          <Text p={0} my={0} fontSize="xs" color="fg.muted">
            {description}
          </Text>
        ) : null}
      </Stack>
      <VStack align="stretch" gap="3">
        {children}
      </VStack>
    </Stack>
  );
}
