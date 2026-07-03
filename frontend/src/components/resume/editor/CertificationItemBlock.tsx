"use client";

import { memo } from "react";
import { Box, HStack, IconButton, VStack } from "@chakra-ui/react";
import { TrashIcon } from "@/components/ui/icons";
import { useCertifications } from "@/hooks/store/useCertifications";
import { t } from "@/lib/i18n";
import type { CertificationItem, Direction } from "@/types";
import { DateField } from "./DateField";
import { EditableText } from "./EditableText";
import { ITEM_HOVER_OUTLINE, itemRemoveButtonProps } from "./HoverFrame";

interface CertificationItemBlockProps {
  item: CertificationItem;
  direction: Direction;
  accentColor: string;
}

export const CertificationItemBlock = memo(function CertificationItemBlock({
  item,
  direction,
  accentColor,
}: CertificationItemBlockProps) {
  const { updateCertification, removeCertification } = useCertifications();

  return (
    <Box
      className="group"
      position="relative"
      dir={direction}
      pb="1.5"
      borderRadius="md"
      _hover={ITEM_HOVER_OUTLINE}
    >
      <VStack align="stretch" gap="0" pe="6">
        <EditableText
          value={item.name}
          onChange={(value) => updateCertification(item.id, { name: value })}
          placeholder={t.certifications.namePlaceholder}
          fontSize="sm"
          fontWeight="bold"
          color={`var(--rz-secondary, ${accentColor})`}
        />
        <HStack gap="2" fontSize="xs" color="fg.muted">
          <EditableText
            value={item.issuer}
            onChange={(value) => updateCertification(item.id, { issuer: value })}
            placeholder={t.certifications.issuerPlaceholder}
            fontSize="xs"
            color={`var(--rz-secondary, ${accentColor})`}
          />
          <DateField
            monthYear
            value={item.date}
            onChange={(value) => updateCertification(item.id, { date: value })}
            placeholder={t.certifications.datePlaceholder}
          />
        </HStack>
      </VStack>

      <IconButton
        aria-label={t.certifications.removeEntry}
        {...itemRemoveButtonProps}
        position="absolute"
        insetInlineEnd="0"
        top="0"
        onClick={() => removeCertification(item.id)}
      >
        <TrashIcon />
      </IconButton>
    </Box>
  );
});
