"use client";

import { Box, chakra, Grid, Text, VStack } from "@chakra-ui/react";
import { BackgroundLayer } from "@/components/resume/backgrounds/BackgroundLayer";
import { CheckIcon } from "@/components/ui/icons";
import { useTheme } from "@/hooks/store/useTheme";
import { backgroundOptions } from "@/lib/backgrounds/options";
import { COLORS, RADII, SHADOWS } from "@/lib/design/tokens";
import { resolveTheme } from "@/lib/themes";

export function BackgroundGrid() {
  const { theme, setBackgroundPattern } = useTheme();
  const colors = resolveTheme(theme);

  return (
    <Grid templateColumns="repeat(4, 1fr)" gap="14px 10px">
      {backgroundOptions.map((option) => {
        const isActive = theme.backgroundPattern === option.id;
        return (
          <VStack key={option.id} gap="7px">
            <chakra.button
              type="button"
              aria-label={option.label}
              aria-pressed={isActive}
              title={option.label}
              position="relative"
              width="100%"
              aspectRatio="1"
              overflow="hidden"
              bg={colors.soft}
              // Shadow-as-border: a calm hairline ring on every thumbnail, an
              // accent halo ring (+ badge) on the selected one.
              transition="transform 0.1s, box-shadow 0.12s"
              _hover={{ transform: "scale(1.04)" }}
              style={{ borderRadius: RADII.card, boxShadow: isActive ? SHADOWS.ring : SHADOWS.hairlineRing }}
              onClick={() => setBackgroundPattern(option.id)}
            >
              <Box position="absolute" inset="0">
                <BackgroundLayer
                  pattern={option.id}
                  accent={colors.accent}
                  base={colors.base}
                  soft={colors.soft}
                  idSuffix={`thumb-${option.id}`}
                  preserveAspectRatio="xMidYMid slice"
                  viewBox="114 -6 96 96"
                />
              </Box>
              {isActive ? (
                <Box
                  position="absolute"
                  top="5px"
                  insetInlineStart="5px"
                  width="16px"
                  height="16px"
                  borderRadius="full"
                  color="white"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="10px"
                  style={{ background: COLORS.accent, boxShadow: SHADOWS.badge }}
                >
                  <CheckIcon />
                </Box>
              ) : null}
            </chakra.button>
            <Text
              fontSize="10.5px"
              fontWeight="500"
              lineClamp={1}
              style={{ color: isActive ? COLORS.accent : COLORS.ink700 }}
            >
              {option.label}
            </Text>
          </VStack>
        );
      })}
    </Grid>
  );
}
