"use client";

import { useState } from "react";
import { Box, chakra, Grid, SegmentGroup, Separator, Stack, Text, VStack } from "@chakra-ui/react";
import AdvertisingUi from "@/components/ads/advertising.ui";
import { COLUMN_WIDTH_TEMPLATE_IDS } from "@/components/resume/templates/registry";
import { LabeledSlider } from "@/components/ui/LabeledSlider";
import { PanelGroup } from "@/components/ui/PanelGroup";
import { SwitchField } from "@/components/ui/SwitchField";
import { useDesign } from "@/hooks/store/useDesign";
import { COLORS, RADII, SHADOWS } from "@/lib/design/tokens";
import { t } from "@/lib/i18n";
import { A4_WIDTH_MM, resolveSideWidthMm } from "@/lib/pagination";
import { isVividThemeId, resolveTheme } from "@/lib/themes";
import type { ColumnWidthId } from "@/types";
import { BackgroundGrid } from "./BackgroundGrid";
import { ColorSwatchGrid } from "./ColorSwatchGrid";

// One advertising slot closes each style block, in order. The ids are fixed
// placements; AdvertisingUi (a no-print sidebar component) owns the actual fill,
// and the whole sidebar is excluded from the exported PDF.
const BLOCK_AD_IDS = [
  "pos-article-display-card-111793",
  "pos-article-display-111792",
  "pos-article-display-card-111952",
] as const;

// The four "Column Layout" width presets, narrowest first. Thumbnail bars are
// drawn at each preset's TRUE share of the A4 width (using the sidebar-column
// template's 64mm base as the representative), so the picker previews real
// proportions instead of a stylised sketch.
const COLUMN_WIDTH_OPTIONS: ColumnWidthId[] = ["small", "medium", "large", "xlarge"];
const COLUMN_WIDTH_PREVIEW_BASE_MM = 64;

function columnPreviewPercent(width: ColumnWidthId): string {
  const sideMm = resolveSideWidthMm(COLUMN_WIDTH_PREVIEW_BASE_MM, width);
  return `${((sideMm / A4_WIDTH_MM) * 100).toFixed(1)}%`;
}

export function DesignPanel() {
  const {
    theme,
    setPageMargin,
    setSectionSpacing,
    setFontScale,
    setLineHeight,
    setBackgroundIntensity,
    setColumnIntensity,
    setColumnWidth,
    setShowSectionIcons,
    setShowSectionSeparators,
    setAtsMode,
    templateId,
  } = useDesign();
  const previewColors = resolveTheme(theme);

  // Which palette family the picker is browsing. Local state only — the ACTIVE
  // mode is derived from the persisted themeId (vivid ids form their own set),
  // so browsing the other tab changes nothing until a swatch is picked.
  const [paletteMode, setPaletteMode] = useState<"classic" | "vivid">(() =>
    isVividThemeId(theme.themeId) ? "vivid" : "classic",
  );

  return (
    <VStack align="stretch" gap="5">
      {/* BLOCK 1 — COLORS (the primary colour picker). */}
      <VStack align="stretch" gap="26px">
        <PanelGroup label={t.design.colors} description={t.design.colorsDesc}>
          <VStack align="stretch" gap="14px">
            <SegmentGroup.Root
              size="sm"
              rounded={"lg"}
              width="100%"
              value={paletteMode}
              onValueChange={(details) =>
                setPaletteMode(details.value === "vivid" ? "vivid" : "classic")
              }
            >
              <SegmentGroup.Indicator       rounded={"lg"} />
              <SegmentGroup.Items
                flex="1"
                fontSize={"xs"}
                items={[
                  { value: "classic", label: t.design.paletteModeClassic },
                  { value: "vivid", label: t.design.paletteModeVivid },
                ]}
              />
            </SegmentGroup.Root>
            <ColorSwatchGrid variant={paletteMode} />
            {/* Resume-wide section-icon toggle — a marker chip beside each heading,
                tinted from the same palette the swatches above choose. */}
            <Stack style={{ borderRadius: RADII.card, boxShadow: SHADOWS.cardSoft, background: "var(--chakra-colors-bg-panel)"}} p={4}>
              <SwitchField
                label={t.design.sectionIcons}
                checked={theme.showSectionIcons}
                onChange={setShowSectionIcons}
              />
              <Text fontSize="xs"  mt="3px" textAlign={"justify"} style={{ color: COLORS.muted }}>
                {t.design.sectionIconsHint}
              </Text>
            </Stack>
            {/* Resume-wide section-separator toggle — a thin hairline under each
                section title, tinted from the same palette (light on dark surfaces). */}
            <Stack style={{ borderRadius: RADII.card, boxShadow: SHADOWS.cardSoft, background: "var(--chakra-colors-bg-panel)"}} p={4}>
              <SwitchField
                label={t.design.sectionSeparators}
                checked={theme.showSectionSeparators}
                onChange={setShowSectionSeparators}
              />
              <Text fontSize="xs" textAlign={"justify"} mt="3px" style={{ color: COLORS.muted }}>
                {t.design.sectionSeparatorsHint}
              </Text>
            </Stack>
            {/* ATS Friendly mode — a resume-wide structural toggle: forces a
                single-column, decoration-free, plain-black-on-white document that
                applicant-tracking systems can parse (and real text, not inputs,
                in the exported PDF). */}
            <Stack style={{ borderRadius: RADII.card, boxShadow: SHADOWS.cardSoft, background: "var(--chakra-colors-bg-panel)"}} p={4}>
              <SwitchField
                label={t.design.atsMode}
                checked={theme.atsMode}
                onChange={setAtsMode}
              />
              <Text fontSize="xs" textAlign={"justify"} mt="3px" style={{ color: COLORS.muted }}>
                {t.design.atsModeHint}
              </Text>
            </Stack>
          </VStack>
        </PanelGroup>
        <AdvertisingUi AdvertisingId={BLOCK_AD_IDS[0]} isShow={true} />
      </VStack>



      {/* BLOCK 2 — BACKGROUNDS (page colour + decorative pattern). */}
      <VStack align="stretch" gap="26px">
        <PanelGroup label={t.design.backgrounds} description={t.design.backgroundsDesc}>
          <VStack align="stretch" gap="20px">
            {/* The «صفحهٔ رنگی» (colored-page) toggle was removed — the A4 page is
                always white now. Decorative patterns and their intensity stay. */}
            <BackgroundGrid />
            {/* Pattern intensity — scales the whole pattern lighter or stronger.
                A vivid palette also drives its page tint from this value, so the
                slider stays visible there even with no pattern selected. */}
            {theme.backgroundPattern !== "none" || isVividThemeId(theme.themeId) ? (
              <LabeledSlider
                label={t.design.backgroundIntensity}
                value={theme.backgroundIntensity}
                min={0.1}
                max={1.25}
                step={0.05}
                minLabel={t.design.lighter}
                maxLabel={t.design.stronger}
                valueText={`${Math.round(theme.backgroundIntensity * 100)}%`}
                onChange={setBackgroundIntensity}
              />
            ) : null}
            {/* Coloured-column intensity — only the column templates use it, but it is
                always available; 100% reproduces each template's original tint. */}
            <LabeledSlider
              label={t.design.columnIntensity}
              value={theme.columnIntensity}
              min={0.5}
              max={2}
              step={0.05}
              minLabel={t.design.lighter}
              maxLabel={t.design.stronger}
              valueText={`${Math.round(theme.columnIntensity * 100)}%`}
              onChange={setColumnIntensity}
            />
            {/* Column Layout — the coloured side column's width preset. Only the
                templates that paint an adjustable column show the picker. */}
            {COLUMN_WIDTH_TEMPLATE_IDS.has(templateId) ? (
              <Box style={{ borderRadius: RADII.card, boxShadow: SHADOWS.cardSoft, background: "var(--chakra-colors-bg-panel)", padding: "13px 14px" }}>
                <Text fontSize="12px" fontWeight="600">
                  {t.design.columnLayout}
                </Text>
                <Grid templateColumns="repeat(4, 1fr)" gap="8px" mt="10px">
                  {COLUMN_WIDTH_OPTIONS.map((width) => {
                    const isActive = theme.columnWidth === width;
                    return (
                      <VStack key={width} gap="5px">
                        <chakra.button
                          type="button"
                          width="100%"
                          height="52px"
                          display="flex"
                          alignItems="stretch"
                          overflow="hidden"
                          padding="5px"
                          gap="4px"
                          background="white"
                          transition="box-shadow 0.12s"
                          style={{ borderRadius: RADII.control, boxShadow: isActive ? SHADOWS.ring : SHADOWS.hairlineRing }}
                          onClick={() => setColumnWidth(width)}
                          aria-label={t.design.columnWidthNames[width]}
                          aria-pressed={isActive}
                        >
                          <Box
                            flexShrink={0}
                            width={columnPreviewPercent(width)}
                            borderRadius="2px"
                            style={{ background: previewColors.base }}
                          />
                          <Box flex="1" borderRadius="2px" background="blackAlpha.100" />
                        </chakra.button>
                        <Text fontSize="10.5px" fontWeight="500" style={{ color: isActive ? COLORS.accent : COLORS.muted }}>
                          {t.design.columnWidthNames[width]}
                        </Text>
                      </VStack>
                    );
                  })}
                </Grid>
                <Text fontSize="11px" lineHeight="1.6" mt="6px" style={{ color: COLORS.muted }}>
                  {t.design.columnLayoutHint}
                </Text>
              </Box>
            ) : null}
          </VStack>
        </PanelGroup>
        <AdvertisingUi AdvertisingId={BLOCK_AD_IDS[1]} isShow={true} />
      </VStack>

      <Separator my="22px" size="xs" borderColor={{ base: "blackAlpha.200", _dark: "border" }} />

      {/* BLOCK 3 — TEXT & SIZE settings (typography + spacing/margins). */}
      <VStack align="stretch" gap="26px">
        <PanelGroup label={t.design.textAndSize} description={t.design.textAndSizeDesc}>
          <VStack align="stretch" gap="26px">
            <LabeledSlider
              label={t.design.fontSize}
              value={theme.fontScale}
              min={0.85}
              max={1.3}
              step={0.05}
              minLabel="A"
              maxLabel="A"
              valueText={`${Math.round(theme.fontScale * 100)}%`}
              onChange={setFontScale}
            />
            <LabeledSlider
              label={t.design.lineHeight}
              value={theme.lineHeight}
              min={1.1}
              max={2}
              step={0.1}
              minLabel={t.design.condensed}
              maxLabel={t.design.spacious}
              valueText={theme.lineHeight.toFixed(1)}
              onChange={setLineHeight}
            />
            <LabeledSlider
              label={t.design.sectionSpacing}
              value={theme.sectionSpacing}
              min={2}
              max={12}
              step={1}
              minLabel={t.design.compact}
              maxLabel={t.design.spacious}
              valueText={`${theme.sectionSpacing}`}
              onChange={setSectionSpacing}
            />
            <LabeledSlider
              label={t.design.pageMargins}
              value={theme.pageMargin}
              min={8}
              max={24}
              step={1}
              minLabel={t.design.narrow}
              maxLabel={t.design.wide}
              valueText={`${theme.pageMargin}`}
              onChange={setPageMargin}
            />
          </VStack>
        </PanelGroup>
        <AdvertisingUi AdvertisingId={BLOCK_AD_IDS[2]} isShow={true} />
      </VStack>
    </VStack>
  );
}
