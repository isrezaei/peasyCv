"use client";

import { Box, Button, Center, Flex, Spinner, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getTemplate } from "@/components/resume/templates/registry";
import { API_BASE_URL } from "@/lib/api/config";
import { getPublicResume } from "@/lib/api/share";
import { normalizeResume } from "@/lib/resume/normalizeResume";
import { useResumeStore } from "@/store/useResumeStore";
import type { ResumeData } from "@/types";

type State =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "ready"; resume: ResumeData; ownerName: string | null; token: string };

/**
 * Public, read-only resume view. Populates the store with the shared resume (so
 * templates that read the store render correctly) WITHOUT starting autosave, and
 * renders the selected template inside a `.resume-readonly` wrapper that hides
 * the editor chrome and disables field interaction. No auth, no editing.
 */
export default function SharePage() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      // Robust across Next versions: read the token straight from the path.
      const match = window.location.pathname.match(/\/share\/([^/?#]+)/);
      const token = match ? decodeURIComponent(match[1]) : "";
      if (!token) {
        if (!cancelled) setState({ kind: "error" });
        return;
      }
      try {
        const { resume, ownerName } = await getPublicResume(token);
        if (cancelled) return;
        const normalized = normalizeResume(resume);
        useResumeStore.getState().setResume(normalized);
        useResumeStore.getState().setHydrated(true);
        setState({ kind: "ready", resume: normalized, ownerName, token });
      } catch {
        if (!cancelled) setState({ kind: "error" });
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.kind === "loading") {
    return (
      <Center height="100vh">
        <Spinner size="lg" />
      </Center>
    );
  }

  if (state.kind === "error") {
    return (
      <Center height="100vh" flexDirection="column" gap="2" p="6" textAlign="center">
        <Text fontSize="lg" fontWeight="medium">
          این لینک معتبر نیست یا غیرفعال شده است.
        </Text>
        <Text color="fg.muted">لطفاً از صاحب رزومه یک لینک جدید بخواهید.</Text>
      </Center>
    );
  }

  const Template = getTemplate(state.resume.templateId).component;

  return (
    <Box minH="100vh" bg="bg.muted" pb="10">
      <Flex
        className="no-print"
        align="center"
        justify="space-between"
        px="5"
        py="3"
        bg="bg.panel"
        borderBottomWidth="1px"
        borderColor="border"
        position="sticky"
        top="0"
        zIndex="1"
      >
        <Text fontWeight="medium">
          {state.ownerName ? `رزومهٔ ${state.ownerName}` : state.resume.title}
        </Text>
        <Button asChild size="sm" colorPalette="accent">
          <a href={`${API_BASE_URL}/pdf/share/${encodeURIComponent(state.token)}`}>دانلود PDF</a>
        </Button>
      </Flex>

      <Box className="resume-readonly" pt="6" display="flex" justifyContent="center">
        <Box width="210mm" bg="white" boxShadow="md">
          <Template resume={state.resume} theme={state.resume.theme} />
        </Box>
      </Box>
    </Box>
  );
}
