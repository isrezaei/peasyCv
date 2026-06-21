"use client";

import { Box, Text, VStack } from "@chakra-ui/react";
import { LabeledSlider } from "@/components/ui/LabeledSlider";
import { PanelGroup } from "@/components/ui/PanelGroup";
import { SwitchField } from "@/components/ui/SwitchField";
import { useDesign } from "@/hooks/store/useDesign";
import { COLORS, RADII, SHADOWS } from "@/lib/design/tokens";
import { t } from "@/lib/i18n";
import { BackgroundGrid } from "./BackgroundGrid";
import { ColorSwatchGrid } from "./ColorSwatchGrid";

export function DesignPanel() {
  const {
    theme,
    setPageMargin,
    setSectionSpacing,
    setFontScale,
    setLineHeight,
    setPageBackground,
  } = useDesign();

  return (
    <VStack align="stretch" gap="26px">
      {/* Standalone sliders carry their own label+value (no duplicate heading). */}
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

      <PanelGroup label={t.design.colors}>
        <ColorSwatchGrid />
      </PanelGroup>

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

      <Box height="1px" style={{ background: COLORS.line06 }} />

      {/* Page background COLOR — independent of the decorative pattern below. */}
      <PanelGroup label={t.design.pageBackground}>
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
      </PanelGroup>

      <PanelGroup label={t.design.backgrounds}>
        <BackgroundGrid />
      </PanelGroup>
    </VStack>
  );
}
