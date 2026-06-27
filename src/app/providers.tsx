"use client";

import { ChakraProvider, LocaleProvider } from "@chakra-ui/react";
import { useEffect, type ReactNode } from "react";
import { chakraSystem } from "@/lib/chakra/system";
import { EmotionRegistry } from "@/lib/chakra/EmotionRegistry";
import { hydrateResumeStore, startAutosave } from "@/store/useResumeStore";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    void hydrateResumeStore();
    const stopAutosave = startAutosave();
    return stopAutosave;
  }, []);

  return (
    <EmotionRegistry>
      <ChakraProvider value={chakraSystem}>
        {/* Persian locale → RTL direction context for all Ark/Chakra components,
            including PORTALED overlays (the sidebar modal, tooltips, popovers) that
            don't inherit `dir` from <html> and would otherwise default to LTR. */}
        <LocaleProvider locale="fa-IR">{children}</LocaleProvider>
      </ChakraProvider>
    </EmotionRegistry>
  );
}
