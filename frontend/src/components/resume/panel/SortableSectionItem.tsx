"use client";

import { Box, HStack, Switch, Text } from "@chakra-ui/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripIcon } from "@/components/ui/icons";
import { COLORS, RADII, SHADOWS } from "@/lib/design/tokens";
import { t } from "@/lib/i18n";
import type { SectionMeta } from "@/types";

export function SortableSectionItem({
  section,
  onToggleVisibility,
}: {
  section: SectionMeta;
  onToggleVisibility: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  return (
    <HStack
      ref={setNodeRef}
      height="48px"
      paddingInline="14px"
      gap="12px"
      bg="white"
      transition="box-shadow 0.12s, opacity 0.12s"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : section.visible ? 1 : 0.55,
        borderRadius: RADII.card,
        boxShadow: isDragging ? SHADOWS.panel : SHADOWS.cardSoft,
      }}
    >
      {/* DOM order toggle → label → grip, so in RTL the toggle leads (start). */}
      <Switch.Root
        size="sm"
        colorPalette="accent"
        checked={section.visible}
        onCheckedChange={onToggleVisibility}
        title={section.visible ? t.sectionPanel.remove : t.sectionPanel.restore}
        flexShrink={0}
      >
        <Switch.HiddenInput />
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
      </Switch.Root>
      <Text flex="1" minW="0" fontWeight="600" fontSize="13.5px" lineClamp={1} style={{ color: COLORS.ink700 }}>
        {section.title}
      </Text>
      <Box
        aria-label={t.sectionPanel.dragHandle}
        cursor="grab"
        fontSize="16px"
        flexShrink={0}
        display="inline-flex"
        // `touch-action: none` is REQUIRED for dnd-kit's PointerSensor to win the
        // gesture on touch devices — without it the browser pans/scrolls the drawer
        // instead of starting the drag, so reordering silently fails on mobile.
        style={{ color: COLORS.faint, touchAction: "none" }}
        _hover={{ color: COLORS.ink500 }}
        {...attributes}
        {...listeners}
      >
        <GripIcon />
      </Box>
    </HStack>
  );
}
