"use client";

import { ChakraProvider } from "@chakra-ui/react";
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
      <ChakraProvider value={chakraSystem}>{children}</ChakraProvider>
    </EmotionRegistry>
  );
}
