"use client";

import { Tooltip as ChakraTooltip, Portal } from "@chakra-ui/react";
import type { ReactNode } from "react";

interface TooltipProps {
  label: string;
  children: ReactNode;
}

export function Tooltip({ label, children }: TooltipProps) {
  return (
    <ChakraTooltip.Root openDelay={150} closeDelay={80}>
      <ChakraTooltip.Trigger asChild>{children}</ChakraTooltip.Trigger>
      <Portal>
        <ChakraTooltip.Positioner>
          <ChakraTooltip.Content
            bg="bg.inverted"
            color="fg.inverted"
            fontSize="xs"
            px="2.5"
            py="1"
            borderRadius="md"
          >
            {label}
          </ChakraTooltip.Content>
        </ChakraTooltip.Positioner>
      </Portal>
    </ChakraTooltip.Root>
  );
}
