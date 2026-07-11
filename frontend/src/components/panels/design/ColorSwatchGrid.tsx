"use client";

import { Box, chakra, Grid } from "@chakra-ui/react";
import { CheckIcon } from "@/components/ui/icons";
import { useTheme } from "@/hooks/store/useTheme";
import { deriveSecondary, themeOrder, themePresets, vividThemeOrder } from "@/lib/themes";

interface ColorSwatchGridProps {
  /**
   * Which palette family the grid shows. "classic" (default) keeps the original
   * grid byte-identical: the 11 classic palettes with the accent + derived
   * secondary diagonal. "vivid" lists the two-tone brand palettes and fills each
   * swatch with the RAW primary/secondary pair — what the swatch shows is
   * exactly what the vivid renderer paints with.
   */
  variant?: "classic" | "vivid";
}

export function ColorSwatchGrid({ variant = "classic" }: ColorSwatchGridProps) {
  const { theme, setThemeId } = useTheme();
  const ids = variant === "vivid" ? vividThemeOrder : themeOrder;

  return (
    <Box>
      <Grid templateColumns="repeat(5, 1fr)" gap="8px 6px">
        {ids.map((id) => {
          const preset = themePresets[id];
          const isActive = theme.themeId === id;
          // Each swatch shows the colour PAIR for that theme: the strong accent
          // (section-heading tier) on one half and its paired secondary tint
          // (entry-title tier) on the other, split on a diagonal. The vivid grid
          // shows the pair raw (primary/secondary as stored), since vivid
          // rendering never derives.
          const pairColor =
            variant === "vivid" ? preset.base : deriveSecondary(preset.accentDark);
          const swatchFill = `linear-gradient(135deg, ${preset.accentDark} 0 50%, ${pairColor} 50% 100%)`;
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
