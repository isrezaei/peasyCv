"use client";

import { ChakraProvider, LocaleProvider } from "@chakra-ui/react";
import { type ReactNode } from "react";
import { Toaster } from "react-hot-toast";
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
          {/* The ONE toast surface (react-hot-toast — never Chakra's own toaster).
              Mounted once, globally, in the top-bar/chrome layer. Styled with the
              app's neutral gray semantic tokens as CSS vars, so it resolves per
              color mode automatically (next-themes flips `.dark` on <html>). RTL:
              the container stays pinned bottom-left while the toast's inner text
              is right-aligned and its icon sits on the correct side. `no-print`
              keeps it off the PDF /print surface. */}
          <Toaster
            position="bottom-center"
            containerClassName="no-print"
            containerStyle={{ bottom: 16, left: 16 }}
            toastOptions={{
              duration: 4000,
              style: {
                background: "var(--chakra-colors-bg-panel)",
                color: "var(--chakra-colors-chrome-ink)",
                boxShadow: "var(--chakra-shadows-panel)",
                borderRadius: "12px",
                fontSize: "13px",
                fontFamily: "var(--font-kalameh), var(--font-vazirmatn), sans-serif",
                direction: "rtl",
                textAlign: "right",
              },
            }}
          />
        </LocaleProvider>
      </ChakraProvider>
    </EmotionRegistry>
  );
}
