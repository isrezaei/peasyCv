"use client";

import { ChakraProvider, LocaleProvider } from "@chakra-ui/react";
import { type ReactNode } from "react";
import { chakraSystem } from "@/lib/chakra/system";
import { EmotionRegistry } from "@/lib/chakra/EmotionRegistry";
import { AuthProvider } from "@/lib/auth/AuthProvider";

export function Providers({ children }: { children: ReactNode }) {
  // Resume hydration + autosave are wired by AuthGate once the user is signed in
  // (they call authenticated API endpoints), not here — so the public /print and
  // /share routes never trigger them.
  return (
    <EmotionRegistry>
      <ChakraProvider value={chakraSystem}>
        {/* Persian locale → RTL direction context for all Ark/Chakra components,
            including PORTALED overlays (the sidebar modal, tooltips, popovers) that
            don't inherit `dir` from <html> and would otherwise default to LTR. */}
        <LocaleProvider locale="fa-IR">
          <AuthProvider>{children}</AuthProvider>
        </LocaleProvider>
      </ChakraProvider>
    </EmotionRegistry>
  );
}
