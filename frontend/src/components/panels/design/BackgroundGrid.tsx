"use client";

import { Box, chakra, Grid } from "@chakra-ui/react";
import { BackgroundLayer } from "@/components/resume/backgrounds/BackgroundLayer";
import { COLUMN_PATTERN_TEMPLATE_IDS } from "@/components/resume/templates/registry";
import { CheckIcon } from "@/components/ui/icons";
import { Tooltip } from "@/components/ui/Tooltip";
import { useDesign } from "@/hooks/store/useDesign";
import { useTheme } from "@/hooks/store/useTheme";
import { backgroundOptions } from "@/lib/backgrounds/options";
import { COLORS, RADII, SHADOWS } from "@/lib/design/tokens";
import { resolveTheme } from "@/lib/themes";

export function BackgroundGrid() {
  const { theme, setBackgroundPattern } = useTheme();
  const { templateId } = useDesign();
  const colors = resolveTheme(theme);
  // On a column template the swatches must preview (and be named after) the
  // COLUMN pattern each id paints in the side column — a different geometric
  // texture from the corner-anchored A4 artwork the other templates render.
  const isColumn = COLUMN_PATTERN_TEMPLATE_IDS.has(templateId);

  return (
    <Grid templateColumns="repeat(4, 1fr)" gap="10px">
      {backgroundOptions.map((option) => {
        const isActive = theme.backgroundPattern === option.id;
        const label = (isColumn && option.columnName) || option.name;
        return (
          // The pattern name shows only as a hover popover (English) — there is no
          // caption under the thumbnail, so the tooltip is the accessible name too.
          <Tooltip key={option.id} label={label}>
            <chakra.button
              type="button"
              aria-label={label}
              aria-pressed={isActive}
              position="relative"
              width="100%"
              aspectRatio="1"
              overflow="hidden"
              bg={colors.soft}
              // Calm hairline ring on every thumbnail (uniform, not a selection
              // cue). Selection is shown ONLY by the check badge below — no border.
              transition="transform 0.1s, box-shadow 0.12s"
              _hover={{ transform: "scale(1.04)" }}
              style={{ borderRadius: RADII.card, boxShadow: SHADOWS.hairlineRing }}
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
                  viewBox={option.thumbViewBox}
                  column={isColumn}
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
          </Tooltip>
        );
      })}
    </Grid>
  );
}
