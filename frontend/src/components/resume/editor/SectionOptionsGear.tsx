"use client";

import { Checkbox, IconButton, Text, VStack } from "@chakra-ui/react";
import { SettingsPopover } from "@/components/ui/SettingsPopover";
import { GearIcon } from "@/components/ui/icons";
import { t } from "@/lib/i18n";
import { SECTION_OPTIONS, type SectionItemMap } from "@/lib/resume/sectionOptions";
import { useResumeStore } from "@/store/useResumeStore";
import type { RemovableSectionType } from "@/types";
import { itemRemoveButtonProps } from "./HoverFrame";

interface SectionOptionsGearProps<K extends RemovableSectionType> {
  sectionType: K;
  item: SectionItemMap[K];
}

/**
 * The per-item gear: rendered immediately beside the item's trash button, in
 * the same chrome container, wearing the SAME props (`itemRemoveButtonProps`) —
 * same size, variant, palette, `no-print`, and `_groupHover` reveal — so the
 * pair reads as one control cluster. `_open` keeps the trigger visible while
 * its popover is open even after the pointer leaves the item.
 *
 * This component knows no option by name: it looks up
 * `SECTION_OPTIONS[sectionType]`, renders one checkbox per entry against the
 * single `item`, and shows the i18n empty-state line when the section registers
 * zero options.
 */
export function SectionOptionsGear<K extends RemovableSectionType>({
  sectionType,
  item,
}: SectionOptionsGearProps<K>) {
  const options = SECTION_OPTIONS[sectionType];

  return (
    <SettingsPopover
      title={t.sectionToolbar.options}
      triggerLabel={t.sectionToolbar.options}
      trigger={
        <IconButton
          aria-label={t.sectionToolbar.options}
          {...itemRemoveButtonProps}
          _open={{ opacity: 1 }}
        >
          <GearIcon />
        </IconButton>
      }
    >
      {options.length === 0 ? (
        <Text fontSize="xs" color="fg.muted" py="1">
          {t.sectionToolbar.noOptions}
        </Text>
      ) : (
        <VStack align="stretch" gap="1" py="1">
          {options.map((option) => (
            <Checkbox.Root
              key={option.id}
              size="sm"
              checked={option.read(item)}
              disabled={!(option.enabled?.(item) ?? true)}
              onCheckedChange={(details) =>
                // getState() satisfies SectionOptionActions structurally.
                option.write(useResumeStore.getState(), item, details.checked === true)
              }
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control borderRadius="lg">
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Checkbox.Label>{option.label}</Checkbox.Label>
            </Checkbox.Root>
          ))}
        </VStack>
      )}
    </SettingsPopover>
  );
}
