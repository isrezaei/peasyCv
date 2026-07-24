"use client";

import { Box, Button, Checkbox, HStack, Separator, SimpleGrid, Stack, Switch, Text, VStack } from "@chakra-ui/react";
import { SettingsPopover } from "@/components/ui/SettingsPopover";
import { DotsIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { useSectionActions } from "@/hooks/store/useSectionActions";
import { useSectionEmptyState } from "@/hooks/store/useSectionEmptyState";
import { t } from "@/lib/i18n";
import {
  LANGUAGE_METER_VARIANTS,
  MONTH_FORMATS,
  SKILL_DISPLAY_MODES,
  SKILL_METER_VARIANTS,
  type SectionMeta,
} from "@/types";
import { SectionDirectionControl } from "./SectionDirectionControl";

interface SectionCompactMenuProps {
  section: SectionMeta;
  /** Light vs dark surrounding column — adapts the solid dots chip. */
  tone?: "onLight" | "onDark";
}

// Clean, full-width menu row: leading icon, left-aligned label, soft hover.
const menuItemProps = {
  size: "2xs",
  variant: "solid",
  colorPalette: "gray",
  width: "100%",
  borderRadius: "lg",
  fontSize : "2xs",
  fontWeight: "500",

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
      <VStack align="stretch" gap="3">

        <SimpleGrid columns={2} gap={2}>
          {addEntry ? (
            <Button {...menuItemProps} onClick={addEntry}>
              <Box display="inline-flex" fontSize="md">
                <PlusIcon />
              </Box>
              {t.sectionToolbar.addEntry}
            </Button>
          ) : null}
          <Button {...menuItemProps} colorPalette={"red"}  onClick={() => toggleSectionVisibility(section.id)}>
            <Box display="inline-flex" fontSize="md">
              <TrashIcon />
            </Box>
            {t.sectionToolbar.delete}
          </Button>
        </SimpleGrid>

        <Separator  border={"1px solid"} borderColor="bg.muted" my="1" />

        <Box px="1">
          <SectionDirectionControl section={section} />
        </Box>


        {(section.type === "experience" || section.type === "education") && (
          <>
            {/* Section-wide period-date display settings — each dated section's
                row keeps its own pair, so Experience and Education configure
                independently through the same generic settings action. */}

            <Separator  border={"1px solid"} borderColor="bg.muted" my="1" />

            <Stack px="1">

              <HStack w={"full"} justify={"space-between"}>
                <Text m={0} color={"fg.muted"} fontSize={"xs"}>{t.periodDates.showMonth}</Text>
              <Switch.Root
                size="sm"
                checked={section.showMonth}
                onCheckedChange={(details) =>
                  setSectionLanguageSettings(section.id, {
                    showMonth: details.checked === true,
                  })
                }
              >
                  <Switch.HiddenInput />
                  <Switch.Control/>
              </Switch.Root>
            </HStack>

              {section.showMonth && (
                <>
                  {/*<Text fontSize="xs" fontWeight="500" color="fg.muted" mt="2" mb="1">*/}
                  {/*  {t.periodDates.monthFormat}*/}
                  {/*</Text>*/}
                  <HStack gap="1">
                    {MONTH_FORMATS.map((format) => (
                      <Button
                        key={format}
                        size="2xs"
                        flex="1"
                        variant={section.monthFormat === format ? "solid" : "subtle"}
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
            </Stack>
          </>
        )}
        {section.type === "achievements" && (
          <>
            {/* Section-wide Achievements display settings — one value for every
                item, persisted on the section itself. The item TITLE is always
                rendered, so only description/icons are toggleable. */}
            <Separator  border={"1px solid"} borderColor="bg.muted" my="1" />
            <Box px="1">
              <VStack align="stretch" gap="1">
                <Switch.Root
                  size="sm"
                  checked={section.achievementShowDescription}
                  onCheckedChange={(details) =>
                    setSectionLanguageSettings(section.id, {
                      achievementShowDescription: details.checked === true,
                    })
                  }
                  style={{justifyContent : "space-between" , display : "flex"}}
                >
                  <Switch.Label fontSize={"xs"}>{t.achievements.showDescription}</Switch.Label>
                  <Switch.HiddenInput />
                  <Switch.Control borderRadius="lg">
                  </Switch.Control>
                </Switch.Root>
                <Switch.Root
                  size="sm"
                  checked={section.achievementShowIcons}
                  onCheckedChange={(details) =>
                    setSectionLanguageSettings(section.id, {
                      achievementShowIcons: details.checked === true,
                    })
                  }
                  style={{justifyContent : "space-between" , display : "flex"}}
                >
                  <Switch.Label fontSize={"xs"}>{t.achievements.showIcons}</Switch.Label>
                  <Switch.HiddenInput />
                  <Switch.Control borderRadius="lg">
                  </Switch.Control>
                </Switch.Root>
              </VStack>
            </Box>
          </>
        )}
        {section.type === "skills" && (
          <>
            {/* Section-wide Skills display settings — one value for every group,
                persisted on the section itself. The per-group title toggle lives
                in each group's own gear popover instead. */}
            <Separator  border={"1px solid"} borderColor="bg.muted" my="1" />
            <Box px="1">
              <Text fontSize="xs" fontWeight="500" color="fg.muted" mb="1">
                {t.skills.displayMode}
              </Text>
              <HStack gap="1">
                {SKILL_DISPLAY_MODES.map((mode) => (
                  <Button
                    key={mode}
                    size="2xs"
                    flex="1"
                    variant={section.skillDisplayMode === mode ? "solid" : "ghost"}
                    colorPalette="gray"
                    borderRadius="lg"
                    onClick={() =>
                      setSectionLanguageSettings(section.id, { skillDisplayMode: mode })
                    }
                  >
                    {t.skills.displayModes[mode]}
                  </Button>
                ))}
              </HStack>
              {/* The level meter is a tag-mode affordance — list mode renders a
                  plain text list, so the toggle (and variants) hide there. The
                  stored value survives, so switching back restores the meters. */}
              {section.skillDisplayMode === "row" && (
                <VStack align="stretch" gap="1" mt="2">
                  <Checkbox.Root
                    size="sm"
                    checked={section.skillShowLevel}
                    onCheckedChange={(details) =>
                      setSectionLanguageSettings(section.id, {
                        skillShowLevel: details.checked === true,
                      })
                    }
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control borderRadius="lg">
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <Checkbox.Label>{t.skills.showLevel}</Checkbox.Label>
                  </Checkbox.Root>
                </VStack>
              )}
              {section.skillDisplayMode === "row" && section.skillShowLevel && (
                <>
                  {/* Meter shapes reuse the Languages meter (and its labels);
                      the pill/capsule shape is deliberately not offered here. */}
                  <Text fontSize="xs" fontWeight="500" color="fg.muted" mt="2" mb="1">
                    {t.languages.meterVariant}
                  </Text>
                  <HStack gap="1">
                    {SKILL_METER_VARIANTS.map((variant) => (
                      <Button
                        key={variant}
                        size="2xs"
                        flex="1"
                        variant={section.skillMeterVariant === variant ? "solid" : "ghost"}
                        colorPalette="gray"
                        borderRadius="lg"
                        onClick={() =>
                          setSectionLanguageSettings(section.id, { skillMeterVariant: variant })
                        }
                      >
                        {t.languages.meterVariants[variant]}
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
