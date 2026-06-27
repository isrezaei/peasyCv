"use client";

import { Box, chakra, Grid } from "@chakra-ui/react";
import { CheckIcon } from "@/components/ui/icons";
import { useTheme } from "@/hooks/store/useTheme";
import { deriveSecondary, themeOrder, themePresets } from "@/lib/themes";

export function ColorSwatchGrid() {
  const { theme, setThemeId } = useTheme();

  return (
    <Box>
      <Grid templateColumns="repeat(5, 1fr)" gap="8px 6px">
        {themeOrder.map((id) => {
          const preset = themePresets[id];
          const isActive = theme.themeId === id;
          // Each swatch shows the colour PAIR for that theme: the strong accent
          // (section-heading tier) on one half and its paired secondary tint
          // (entry-title tier) on the other, split on a diagonal.
          const swatchFill = `linear-gradient(135deg, ${preset.accentDark} 0 50%, ${deriveSecondary(preset.accentDark)} 50% 100%)`;
          // Selection is shown by a centred white check icon over the swatch (no
          // border/ring) — the same check-as-indicator approach as the backgrounds
          // grid. A drop-shadow keeps it legible on the lighter half of the swatch.
          return (
            <chakra.button
              key={id}
              type="button"
              aria-label={preset.label}
              aria-pressed={isActive}
              title={preset.label}
              position="relative"
              // Taller elongated pill with a FULL corner radius (stadium ends),
              // sitting close together via the tight grid gap.
              width="100%"
              height="25px"
              borderRadius={"2xl"}
              p="0"
              style={{ background: swatchFill }}
              transition="transform 0.1s"
              _hover={{ transform: "scale(1.06)" }}
              onClick={() => setThemeId(id)}
            >
              <Box
                position="absolute"
                inset="0"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontSize="14px"
                opacity={isActive ? 1 : 0}
                transition="opacity 0.12s"
                style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.45))" }}
              >
                <CheckIcon />
              </Box>
            </chakra.button>
          );
        })}
      </Grid>
    </Box>
  );
}
