"use client";

import { Box, Separator, Text, VStack } from "@chakra-ui/react";
import AdvertisingUi from "@/components/ads/advertising.ui";
import { LabeledSlider } from "@/components/ui/LabeledSlider";
import { PanelGroup } from "@/components/ui/PanelGroup";
import { SwitchField } from "@/components/ui/SwitchField";
import { useDesign } from "@/hooks/store/useDesign";
import { COLORS, RADII, SHADOWS } from "@/lib/design/tokens";
import { t } from "@/lib/i18n";
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

export function DesignPanel() {
  const {
    theme,
    setPageMargin,
    setSectionSpacing,
    setFontScale,
    setLineHeight,
    setPageBackground,
    setBackgroundIntensity,
    setColumnIntensity,
  } = useDesign();

  return (
    <VStack align="stretch" gap="0">
      {/* BLOCK 1 — COLORS (the primary colour picker). */}
      <VStack align="stretch" gap="26px">
        <PanelGroup label={t.design.colors} description={t.design.colorsDesc}>
          <ColorSwatchGrid />
        </PanelGroup>
        <AdvertisingUi AdvertisingId={BLOCK_AD_IDS[0]} isShow={true} />
      </VStack>

      <Separator my="22px" size="xs" borderColor="blackAlpha.200" />

      {/* BLOCK 2 — BACKGROUNDS (page colour + decorative pattern). */}
      <VStack align="stretch" gap="26px">
        <PanelGroup label={t.design.backgrounds} description={t.design.backgroundsDesc}>
          <VStack align="stretch" gap="20px">
            <Box style={{ borderRadius: RADII.card, boxShadow: SHADOWS.cardSoft, background: "#fff", padding: "13px 14px" }}>
              <SwitchField
                label={t.design.coloredPage}
                checked={theme.pageBackground === "theme"}
                onChange={(checked) => setPageBackground(checked ? "theme" : "white")}
              />
              <Text fontSize="11px" lineHeight="1.6" mt="3px" style={{ color: COLORS.muted }}>
                {t.design.coloredPageHint}
              </Text>
            </Box>
            <BackgroundGrid />
            {/* Pattern intensity — scales the whole pattern lighter or stronger. */}
            {theme.backgroundPattern !== "none" ? (
              <LabeledSlider
                label={t.design.backgroundIntensity}
                value={theme.backgroundIntensity}
                min={0.35}
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
              max={1.5}
              step={0.05}
              minLabel={t.design.lighter}
              maxLabel={t.design.stronger}
              valueText={`${Math.round(theme.columnIntensity * 100)}%`}
              onChange={setColumnIntensity}
            />
          </VStack>
        </PanelGroup>
        <AdvertisingUi AdvertisingId={BLOCK_AD_IDS[1]} isShow={true} />
      </VStack>

      <Separator my="22px" size="xs" borderColor="blackAlpha.200" />

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
