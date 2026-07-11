"use client";

import { Box, Button, Checkbox, HStack, Separator, Text, VStack } from "@chakra-ui/react";
import { SettingsPopover } from "@/components/ui/SettingsPopover";
import { DotsIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { useSectionActions } from "@/hooks/store/useSectionActions";
import { useSectionEmptyState } from "@/hooks/store/useSectionEmptyState";
import { t } from "@/lib/i18n";
import { LANGUAGE_METER_VARIANTS, MONTH_FORMATS, type SectionMeta } from "@/types";
import { SectionDirectionControl } from "./SectionDirectionControl";

interface SectionCompactMenuProps {
  section: SectionMeta;
  /** Light vs dark surrounding column — adapts the solid dots chip. */
  tone?: "onLight" | "onDark";
}

// Clean, full-width menu row: leading icon, left-aligned label, soft hover.
const menuItemProps = {
  size: "sm",
  variant: "ghost",
  colorPalette: "gray",
  width: "100%",
  justifyContent: "flex-start",
  gap: "2.5",
  borderRadius: "lg",
  fontWeight: "500",
  color: "fg.muted",
  _hover: { bg: "bg.muted", color: "fg" },
} as const;

/**
 * Every section's HoverFrame: ONE bare 3-dots glyph in the resume accent (kept off
 * the layout flow by {@link SectionFrame}, so it never displaces the heading or its
 * rule) that opens a clean menu with the section's tools — add entry, delete, and
 * the text-direction control.
 */
export function SectionCompactMenu({ section, tone = "onLight" }: SectionCompactMenuProps) {
  const { addEntry } = useSectionEmptyState(section.type);
  const { toggleSectionVisibility, setSectionLanguageSettings } = useSectionActions();

  return (
    <SettingsPopover
      title={section.title}
      triggerLabel={t.sectionToolbar.settings}
      triggerSize="2xs"
      icon={<DotsIcon />}
      triggerRest={0.55}
      tone={tone}
    >
      <VStack align="stretch" gap="0.5">
        {addEntry ? (
          <Button {...menuItemProps} onClick={addEntry}>
            <Box display="inline-flex" fontSize="md">
              <PlusIcon />
            </Box>
            {t.sectionToolbar.addEntry}
          </Button>
        ) : null}
        <Button {...menuItemProps} onClick={() => toggleSectionVisibility(section.id)}>
          <Box display="inline-flex" fontSize="md">
            <TrashIcon />
          </Box>
          {t.sectionToolbar.delete}
        </Button>
        <Separator borderColor="border" my="1.5" />
        <Box px="1">
          <SectionDirectionControl section={section} />
        </Box>
        {(section.type === "experience" || section.type === "education") && (
          <>
            {/* Section-wide period-date display settings — each dated section's
                row keeps its own pair, so Experience and Education configure
                independently through the same generic settings action. */}
            <Separator borderColor="border" my="1.5" />
            <Box px="1">
              <Checkbox.Root
                size="sm"
                checked={section.showMonth}
                onCheckedChange={(details) =>
                  setSectionLanguageSettings(section.id, {
                    showMonth: details.checked === true,
                  })
                }
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control borderRadius="lg">
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Label>{t.periodDates.showMonth}</Checkbox.Label>
              </Checkbox.Root>
              {section.showMonth && (
                <>
                  <Text fontSize="xs" fontWeight="500" color="fg.muted" mt="2" mb="1">
                    {t.periodDates.monthFormat}
                  </Text>
                  <HStack gap="1">
                    {MONTH_FORMATS.map((format) => (
                      <Button
                        key={format}
                        size="2xs"
                        flex="1"
                        variant={section.monthFormat === format ? "solid" : "ghost"}
                        colorPalette="gray"
                        borderRadius="lg"
                        onClick={() =>
                          setSectionLanguageSettings(section.id, { monthFormat: format })
                        }
                      >
                        {t.periodDates.monthFormats[format]}
                      </Button>
                    ))}
                  </HStack>
                </>
              )}
            </Box>
          </>
        )}
        {section.type === "languages" && (
          <>
            {/* Section-wide Languages display settings — one value for every
                item, persisted on the section itself. */}
            <Separator borderColor="border" my="1.5" />
            <Box px="1">
              <Text fontSize="xs" fontWeight="500" color="fg.muted" mb="1">
                {t.languages.meterVariant}
              </Text>
              <HStack gap="1">
                {LANGUAGE_METER_VARIANTS.map((variant) => (
                  <Button
                    key={variant}
                    size="2xs"
                    flex="1"
                    variant={section.languageMeterVariant === variant ? "solid" : "ghost"}
                    colorPalette="gray"
                    borderRadius="lg"
                    onClick={() =>
                      setSectionLanguageSettings(section.id, { languageMeterVariant: variant })
                    }
                  >
                    {t.languages.meterVariants[variant]}
                  </Button>
                ))}
              </HStack>
              <VStack align="stretch" gap="1" mt="2">
                <Checkbox.Root
                  size="sm"
                  checked={section.languageShowMeter}
                  onCheckedChange={(details) =>
                    setSectionLanguageSettings(section.id, {
                      languageShowMeter: details.checked === true,
                    })
                  }
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control borderRadius="lg">
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Label>{t.languages.showMeter}</Checkbox.Label>
                </Checkbox.Root>
                <Checkbox.Root
                  size="sm"
                  checked={section.languageShowLevelText}
                  onCheckedChange={(details) =>
                    setSectionLanguageSettings(section.id, {
                      languageShowLevelText: details.checked === true,
                    })
                  }
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control borderRadius="lg">
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Label>{t.languages.showLevelText}</Checkbox.Label>
                </Checkbox.Root>
              </VStack>
            </Box>
          </>
        )}
      </VStack>
    </SettingsPopover>
  );
}
