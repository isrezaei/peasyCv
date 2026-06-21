"use client";

import { Center, ClientOnly, Spinner } from "@chakra-ui/react";
import { AppShell } from "@/components/layout/AppShell";
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
      <AppShell>
        <ResumeCanvas />
      </AppShell>
    </ClientOnly>
  );
}
