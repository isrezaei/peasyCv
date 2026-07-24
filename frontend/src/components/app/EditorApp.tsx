"use client";

import { useEffect } from "react";
import { Center, ClientOnly, Spinner } from "@chakra-ui/react";
import { ThemeProvider } from "next-themes";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGate } from "@/components/auth/AuthGate";
import { OccupationGate } from "@/components/occupation/OccupationGate";
import { ResumeCanvas } from "@/components/resume/canvas/ResumeCanvas";
import { pingDailyVisit } from "@/lib/metrics/visitBeacon";

export function EditorApp() {
  // Daily anonymous visit beacon (editor mounts only — never /print or /share).
  useEffect(() => {
    pingDailyVisit();
  }, []);

  // Color mode lives HERE, not in the root providers: only the editor app ever
  // mounts next-themes, so the public /print and /share routes can never receive
  // the `.dark` class — the PDF pipeline and shared pages stay light by
  // construction. The choice persists as an app preference (localStorage
  // "theme"), never as résumé data. `attribute="class"` drives Chakra v3's
  // built-in `.dark` condition; "system" follows prefers-color-scheme.
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ClientOnly
        fallback={
          <Center height="100vh">
            <Spinner size="lg" />
          </Center>
        }
      >
        <AuthGate>
          <OccupationGate>
            <AppShell>
              <ResumeCanvas />
            </AppShell>
          </OccupationGate>
        </AuthGate>
      </ClientOnly>
    </ThemeProvider>
  );
}
