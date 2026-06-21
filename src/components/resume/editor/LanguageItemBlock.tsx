"use client";

import { memo } from "react";
import { Box, HStack, IconButton } from "@chakra-ui/react";
import { TrashIcon } from "@/components/ui/icons";
import { useLanguages } from "@/hooks/store/useLanguages";
import { t } from "@/lib/i18n";
import type { Direction, LanguageItem } from "@/types";
import { EditableText } from "./EditableText";
import { LanguageLevelMeter } from "./LanguageLevelMeter";

interface LanguageItemBlockProps {
  item: LanguageItem;
  direction: Direction;
  accentColor: string;
}

export const LanguageItemBlock = memo(function LanguageItemBlock({
  item,
  direction,
  accentColor,
}: LanguageItemBlockProps) {
  const { updateLanguage, setLanguageLevel, removeLanguage } = useLanguages();

  return (
    <Box className="group" position="relative" dir={direction} pb="1">
      <HStack justify="space-between" gap="2">
        <Box flex="1" minW="0">
          <EditableText
            value={item.name}
            onChange={(value) => updateLanguage(item.id, { name: value })}
            placeholder={t.languages.namePlaceholder}
            fontSize="sm"
            fontWeight="medium"
          />
        </Box>
        <LanguageLevelMeter
          level={item.level}
          accentColor={accentColor}
          editable
          onChange={(level) => setLanguageLevel(item.id, level)}
        />
        <IconButton
          aria-label={t.languages.removeEntry}
          size="2xs"
          variant="ghost"
          colorPalette="red"
          className="no-print"
          opacity="0"
          _groupHover={{ opacity: 1 }}
          onClick={() => removeLanguage(item.id)}
        >
          <TrashIcon />
        </IconButton>
      </HStack>
    </Box>
  );
});
