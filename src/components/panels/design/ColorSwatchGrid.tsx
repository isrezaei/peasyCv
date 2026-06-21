"use client";

import {
  Box,
  chakra,
  ColorPicker,
  Grid,
  HStack,
  parseColor,
  Portal,
  Text,
} from "@chakra-ui/react";
import { useTheme } from "@/hooks/store/useTheme";
import { COLORS, RADII, SHADOWS } from "@/lib/design/tokens";
import { t } from "@/lib/i18n";
import { resolveTheme, themeOrder, themePresets } from "@/lib/themes";

export function ColorSwatchGrid() {
  const { theme, setThemeId, setCustomColor } = useTheme();
  const customActive = Boolean(theme.customColor);
  const pickerValue = parseColor(theme.customColor ?? resolveTheme(theme).accent);

  return (
    <Box>
      <Grid templateColumns="repeat(5, 1fr)" gap="14px 12px">
        {themeOrder.map((id) => {
          const preset = themePresets[id];
          const isActive = !customActive && theme.themeId === id;
          // Selection is shown by an inner white + hairline ring drawn on top of
          // the swatch — borderless, calm, matching the 2026 reference.
          return (
            <chakra.button
              key={id}
              type="button"
              aria-label={preset.label}
              aria-pressed={isActive}
              title={preset.label}
              position="relative"
              boxSize="30px"
              borderRadius="full"
              p="0"
              justifySelf="center"
              bg={preset.base}
              transition="transform 0.1s"
              _hover={{ transform: "scale(1.1)" }}
              onClick={() => setThemeId(id)}
            >
              <Box
                position="absolute"
                inset="0"
                borderRadius="full"
                opacity={isActive ? 1 : 0}
                transition="opacity 0.12s"
                style={{ boxShadow: SHADOWS.swatchInnerRing }}
              />
            </chakra.button>
          );
        })}
      </Grid>

      <ColorPicker.Root
        value={pickerValue}
        onValueChange={(details) => setCustomColor(details.value.toString("hex"))}
        positioning={{ placement: "bottom-start" }}
        mt="3"
      >
        <ColorPicker.HiddenInput />
        <ColorPicker.Control>
          <ColorPicker.Trigger asChild>
            <HStack
              as="button"
              gap="10px"
              width="100%"
              height="42px"
              cursor="pointer"
              paddingInline="14px"
              transition="box-shadow 0.12s"
              style={{ borderRadius: RADII.card, background: "#fff", boxShadow: SHADOWS.card }}
              _hover={{ boxShadow: SHADOWS.cardHover }}
            >
              <Box
                width="22px"
                height="22px"
                borderRadius="full"
                overflow="hidden"
                style={{ boxShadow: "inset 0 0 0 2px #fff" }}
                bg={
                  theme.customColor ??
                  "conic-gradient(from 180deg, #f87171, #fbbf24, #34d399, #60a5fa, #a78bfa, #f87171)"
                }
              />
              <Text fontSize="12.5px" fontWeight="500" style={{ color: customActive ? COLORS.accent : COLORS.ink700 }}>
                {t.design.customColor}
              </Text>
            </HStack>
          </ColorPicker.Trigger>
        </ColorPicker.Control>
        <Portal>
          <ColorPicker.Positioner>
            <ColorPicker.Content
              borderRadius="2xl"
              borderWidth="1px"
              borderColor="blackAlpha.100"
              boxShadow="lg"
              p="3"
              gap="3"
            >
              <ColorPicker.Area borderRadius="lg" height="120px">
                <ColorPicker.AreaBackground borderRadius="lg" />
                <ColorPicker.AreaThumb />
              </ColorPicker.Area>
              <ColorPicker.ChannelSlider channel="hue" borderRadius="full">
                <ColorPicker.ChannelSliderTrack borderRadius="full" />
                <ColorPicker.ChannelSliderThumb />
              </ColorPicker.ChannelSlider>
              <ColorPicker.ChannelInput
                channel="hex"
                borderRadius="lg"
                borderWidth="1px"
                borderColor="blackAlpha.200"
                width="100%"
                px="2"
                py="1"
                fontSize="xs"
              />
            </ColorPicker.Content>
          </ColorPicker.Positioner>
        </Portal>
      </ColorPicker.Root>
    </Box>
  );
}
