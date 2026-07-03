"use client";

import { HStack, Slider, Text, VStack } from "@chakra-ui/react";
import { COLORS, SHADOWS } from "@/lib/design/tokens";

interface LabeledSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  minLabel?: string;
  maxLabel?: string;
  valueText?: string;
  onChange: (value: number) => void;
}

/**
 * A labelled slider matching the design exactly: 11px/600/0.04em muted label,
 * 12px/600 dark tabular value, a 2px #e4e4e7 track with an indigo range and a
 * 14px white thumb (layered shadow). Min/max captions sit 8px below.
 */
export function LabeledSlider({
  label,
  value,
  min,
  max,
  step,
  minLabel,
  maxLabel,
  valueText,
  onChange,
}: LabeledSliderProps) {
  return (
    <VStack align="stretch" gap="0">
      <HStack justify="space-between" mb="12px">
        <Text fontSize="11px" fontWeight="600" letterSpacing="0.04em" style={{ color: COLORS.muted }}>
          {label}
        </Text>
        {valueText ? (
          <Text fontSize="12px" fontWeight="600" fontVariantNumeric="tabular-nums" style={{ color: COLORS.ink700 }}>
            {valueText}
          </Text>
        ) : null}
      </HStack>
      <Slider.Root
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(details) => onChange(details.value[0])}
        colorPalette="accent"
      >
        <Slider.Control>
          <Slider.Track height="2px" style={{ background: COLORS.track }}>
            <Slider.Range />
          </Slider.Track>
          <Slider.Thumb index={0} boxSize="14px" borderWidth="0" bg="white" style={{ boxShadow: SHADOWS.thumb }}>
            <Slider.HiddenInput />
          </Slider.Thumb>
        </Slider.Control>
      </Slider.Root>
      {minLabel || maxLabel ? (
        <HStack justify="space-between" mt="8px">
          <Text fontSize="11px" style={{ color: COLORS.muted }}>
            {minLabel}
          </Text>
          <Text fontSize="11px" style={{ color: COLORS.muted }}>
            {maxLabel}
          </Text>
        </HStack>
      ) : null}
    </VStack>
  );
}
