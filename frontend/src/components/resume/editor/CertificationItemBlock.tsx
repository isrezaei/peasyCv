"use client";

import { memo } from "react";
import { Box, HStack, IconButton, VStack } from "@chakra-ui/react";
import { TrashIcon } from "@/components/ui/icons";
import { useCertifications } from "@/hooks/store/useCertifications";
import { periodDateFormat } from "@/lib/dates/format";
import { t } from "@/lib/i18n";
import type { CertificationItem, Direction, MonthFormat } from "@/types";
import { DateField } from "./DateField";
import { EditableText } from "./EditableText";
import { ITEM_HOVER_OUTLINE, itemRemoveButtonProps } from "./HoverFrame";
import { SectionOptionsGear } from "./SectionOptionsGear";

interface CertificationItemBlockProps {
  item: CertificationItem;
  direction: Direction;
  accentColor: string;
  /**
   * ONE-ROW composition (the timeline-panel design, exclusive to it): the name
   * and «issuer · date» share a single baseline row (13px/700 name, 11px muted
   * meta — the `CERT_INLINE_*` paint↔reserve constants), the date following the
   * section's period-date display settings. Must match the flow's
   * `LayoutMetrics.certInlineMeta`.
   */
  inlineMeta?: boolean;
  /** Section-wide period-date settings, honoured by the inline meta row. */
  showMonth?: boolean;
  monthFormat?: MonthFormat;
}

export const CertificationItemBlock = memo(function CertificationItemBlock({
  item,
  direction,
  accentColor,
  inlineMeta = false,
  showMonth = true,
  monthFormat = "name",
}: CertificationItemBlockProps) {
  const { updateCertification, removeCertification } = useCertifications();
  // Every rendered field of a visible section validates (see ExperienceItemBlock).
  const validate = true;

  if (inlineMeta) {
    return (
      <Box
        className="group"
        position="relative"
        dir={direction}
        pb="1.5"
        borderRadius="md"
        _hover={ITEM_HOVER_OUTLINE}
      >
        <HStack justify="space-between" align="baseline" gap="3" pe="6" minW="0">
          <Box flex="1" minW="0">
            <EditableText
              value={item.name}
              onChange={(value) => updateCertification(item.id, { name: value })}
              placeholder={t.certifications.namePlaceholder}
              validate={validate}
              fontSize="0.8667em"
              fontWeight="700"
              color={`var(--rz-secondary, ${accentColor})`}
              truncateEnd
            />
          </Box>
          {/* The meta is one compact atom that always shows in full; a long NAME
              is what gives way (it end-ellipsizes). The cap + clip is the
              backstop for an absurdly long issuer. */}
          <HStack
            gap="1"
            flexShrink={0}
            maxW="65%"
            overflow="hidden"
            color="fg.muted"
            align="baseline"
          >
            {/* `flexShrink=0` is load-bearing. An auto-width field's hidden
                sizer is a BLOCK box, so the field only reports its true text
                width when nothing shrinks it. As a DIRECT flex item the field's
                own wrapper carries `flex-shrink: 1` and a `1ch` min-width, and
                Chrome settles on a stable-but-wrong equilibrium: the wrapper
                shrinks, the content-sized row shrinks to match, and the issuer
                clips to its first word («Frontend Masters» measured 44.7px
                instead of 86.6px). This box takes the flex-item role instead. */}
            <Box flexShrink={0}>
              <EditableText
                value={item.issuer}
                onChange={(value) => updateCertification(item.id, { issuer: value })}
                placeholder={t.certifications.issuerPlaceholder}
                validate={validate}
                fontSize="0.7333em"
                color="fg.muted"
                // A Latin issuer («Frontend Masters») must keep its own base
                // direction inside this RTL row, or its words reorder around the
                // «·» and the year.
                dir="auto"
                autoWidth
              />
            </Box>
            <Box as="span" fontSize="0.7333em" aria-hidden>
              ·
            </Box>
            <DateField
              monthYear
              format={periodDateFormat(showMonth, monthFormat)}
              value={item.date}
              onChange={(value) => updateCertification(item.id, { date: value })}
              placeholder={t.certifications.datePlaceholder}
              validate={validate}
              fontSize="0.7333em"
            />
          </HStack>
        </HStack>

        <Box className="no-print" display="flex" position="absolute" insetInlineEnd="0" top="0">
          <SectionOptionsGear sectionType="certifications" item={item} />
          <IconButton
            aria-label={t.certifications.removeEntry}
            {...itemRemoveButtonProps}
            onClick={() => removeCertification(item.id)}
          >
            <TrashIcon />
          </IconButton>
        </Box>
      </Box>
    );
  }

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
          validate={validate}
          fontSize="sm"
          fontWeight="bold"
          color={`var(--rz-secondary, ${accentColor})`}
        />
        <HStack gap="2" fontSize="xs" color="fg.muted">
          <EditableText
            value={item.issuer}
            onChange={(value) => updateCertification(item.id, { issuer: value })}
            placeholder={t.certifications.issuerPlaceholder}
            validate={validate}
            fontSize="xs"
            color={`var(--rz-secondary, ${accentColor})`}
          />
          <DateField
            monthYear
            value={item.date}
            onChange={(value) => updateCertification(item.id, { date: value })}
            placeholder={t.certifications.datePlaceholder}
            validate={validate}
          />
        </HStack>
      </VStack>

      {/* Item chrome overlay — off the layout flow (content clears it via the
          pre-existing pe="6"). DOM order gear→trash keeps the trash flush at
          the inline-end corner it has always occupied. */}
      <Box
        className="no-print"
        display="flex"
        position="absolute"
        insetInlineEnd="0"
        top="0"
      >
        <SectionOptionsGear sectionType="certifications" item={item} />
        <IconButton
          aria-label={t.certifications.removeEntry}
          {...itemRemoveButtonProps}
          onClick={() => removeCertification(item.id)}
        >
          <TrashIcon />
        </IconButton>
      </Box>
    </Box>
  );
});
