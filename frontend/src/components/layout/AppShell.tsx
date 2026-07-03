import { Box, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { TemplateSwitchAd } from "@/components/ads/TemplateSwitchAd";
import { ContextualSidebar } from "./ContextualSidebar";
import { TopBar } from "./TopBar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <VStack align="stretch" gap="0" height="100vh" bg="white">
      <TopBar />
      {/* Workspace: a FIXED, non-scrolling frame (`overflow:hidden`) on a white
          underlay. The canvas inside owns the single vertical scroll for the
          pages; this frame never produces a scrollbar of its own. The side panel
          is an absolutely-positioned overlay layered on top. */}
      <Box position="relative" flex="1" overflow="hidden" bg="white">
        {children}
        <ContextualSidebar />
      </Box>
      {/* Every 2nd template switch shows an ad modal (no-print, editor-only). */}
      <TemplateSwitchAd />
    </VStack>
  );
}
