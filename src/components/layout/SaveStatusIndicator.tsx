"use client";

import { Box, HStack, Spinner, Text } from "@chakra-ui/react";
import { CheckIcon } from "@/components/ui/icons";
import { useSaveStatus } from "@/hooks/store/useSaveStatus";
import { COLORS } from "@/lib/design/tokens";
import { t } from "@/lib/i18n";

export function SaveStatusIndicator() {
  const { saveStatus } = useSaveStatus();

  if (saveStatus === "idle") return null;

  const isSaving = saveStatus === "saving";

  return (
    <HStack gap="5px">
      {isSaving ? (
        <Spinner size="xs" color={COLORS.muted} />
      ) : (
        <Box as="span" display="flex" fontSize="13px" style={{ color: COLORS.saveGreen }}>
          <CheckIcon />
        </Box>
      )}
      <Text fontSize="12.5px" fontWeight="500" style={{ color: COLORS.ink500 }}>
        {isSaving ? t.toolbar.saving : t.toolbar.autosaved}
      </Text>
    </HStack>
  );
}
