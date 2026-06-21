"use client";

import { Box, Heading, Text } from "@chakra-ui/react";
import { SectionManagementPanel } from "@/components/resume/panel/SectionManagementPanel";
import { COLORS } from "@/lib/design/tokens";
import { t } from "@/lib/i18n";

export function RearrangePanel() {
  return (
    <Box>
      <Heading as="h3" fontSize="15px" fontWeight="700" letterSpacing="-0.01em" style={{ color: COLORS.ink }}>
        {t.sectionPanel.title}
      </Heading>
      <Text fontSize="12.5px" mt="5px" mb="22px" style={{ color: COLORS.muted }}>
        {t.sectionPanel.subtitle}
      </Text>
      <SectionManagementPanel />
    </Box>
  );
}
