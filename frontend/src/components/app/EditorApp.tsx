"use client";

import { Center, ClientOnly, Spinner } from "@chakra-ui/react";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGate } from "@/components/auth/AuthGate";
import { ResumeCanvas } from "@/components/resume/canvas/ResumeCanvas";

export function EditorApp() {
  return (
    <ClientOnly
      fallback={
        <Center height="100vh">
          <Spinner size="lg" />
        </Center>
      }
    >
      <AuthGate>
        <AppShell>
          <ResumeCanvas />
        </AppShell>
      </AuthGate>
    </ClientOnly>
  );
}
