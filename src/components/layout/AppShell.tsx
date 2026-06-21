import { Box, HStack, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { ContextualSidebar } from "./ContextualSidebar";
import { TopBar } from "./TopBar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <VStack align="stretch" gap="0" height="100vh" bg="#f4f4f5">
      <TopBar />
      <HStack align="stretch" flex="1" gap="0" overflow="hidden">
        <ContextualSidebar />
        <Box flex="1" height="100%" overflow="hidden" position="relative">
          {children}
        </Box>
      </HStack>
    </VStack>
  );
}
