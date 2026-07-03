"use client";

import { Box, chakra, HStack } from "@chakra-ui/react";
import type { LanguageLevel } from "@/types";

interface LanguageLevelMeterProps {
  level: LanguageLevel;
  accentColor: string;
  editable?: boolean;
  onChange?: (level: LanguageLevel) => void;
}

const DOTS: LanguageLevel[] = [1, 2, 3, 4, 5];

export function LanguageLevelMeter({
  level,
  accentColor,
  editable = false,
  onChange,
}: LanguageLevelMeterProps) {
  return (
    <HStack gap="1">
      {DOTS.map((dot) => {
        const filled = dot <= level;
        const dotStyle = {
          width: "9px",
          height: "9px",
          borderRadius: "full",
          bg: filled ? accentColor : "transparent",
          borderWidth: "1.5px",
          borderColor: accentColor,
        } as const;
        return editable ? (
          <chakra.button
            key={dot}
            type="button"
            {...dotStyle}
            cursor="pointer"
            aria-label={`سطح ${dot}`}
            onClick={onChange ? () => onChange(dot) : undefined}
          />
        ) : (
          <Box key={dot} {...dotStyle} />
        );
      })}
    </HStack>
  );
}
