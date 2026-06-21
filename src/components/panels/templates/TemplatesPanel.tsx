"use client";

import { AspectRatio, Box, chakra, Grid, Heading, Text, VStack } from "@chakra-ui/react";
import { templateOrder, templateRegistry } from "@/components/resume/templates/registry";
import { CheckIcon } from "@/components/ui/icons";
import { useTemplate } from "@/hooks/store/useTemplate";
import { useTheme } from "@/hooks/store/useTheme";
import { COLORS, RADII, SHADOWS } from "@/lib/design/tokens";
import { t } from "@/lib/i18n";
import { resolveTheme } from "@/lib/themes";
import { TemplateThumbnail } from "./TemplateThumbnail";

export function TemplatesPanel() {
  const { templateId, setTemplate } = useTemplate();
  const { theme } = useTheme();
  const colors = resolveTheme(theme);

  return (
    <Box>
      <Heading as="h3" fontSize="15px" fontWeight="700" letterSpacing="-0.01em" style={{ color: COLORS.ink }}>
        {t.templatesPanel.title}
      </Heading>
      <Text fontSize="12.5px" mt="5px" mb="22px" style={{ color: COLORS.muted }}>
        {t.templatesPanel.subtitle}
      </Text>
      <Grid templateColumns="repeat(2, 1fr)" gap="18px 16px">
        {templateOrder.map((id) => {
          const isActive = templateId === id;
          return (
            <VStack key={id} gap="8px">
              <chakra.button
                type="button"
                position="relative"
                width="100%"
                overflow="hidden"
                transition="box-shadow 0.12s"
                style={{ borderRadius: RADII.card, boxShadow: isActive ? SHADOWS.ring : SHADOWS.hairlineRing }}
                onClick={() => setTemplate(id)}
                aria-label={templateRegistry[id].label}
              >
                <AspectRatio ratio={1 / 1.32}>
                  <Box position="relative">
                    <TemplateThumbnail templateId={id} accent={colors.accent} soft={colors.base} />
                  </Box>
                </AspectRatio>
                {isActive ? (
                  <Box
                    position="absolute"
                    top="7px"
                    insetInlineStart="7px"
                    width="18px"
                    height="18px"
                    borderRadius="full"
                    color="white"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="11px"
                    style={{ background: COLORS.accent, boxShadow: SHADOWS.badge }}
                  >
                    <CheckIcon />
                  </Box>
                ) : null}
              </chakra.button>
              <Text fontSize="12px" fontWeight="500" style={{ color: isActive ? COLORS.accent : COLORS.ink700 }}>
                {templateRegistry[id].label}
              </Text>
            </VStack>
          );
        })}
      </Grid>
    </Box>
  );
}
