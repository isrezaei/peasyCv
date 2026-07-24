"use client";

import { Box, Button, HStack, IconButton, SegmentGroup, Separator, Text, VStack } from "@chakra-ui/react";
import { SettingsPopover } from "@/components/ui/SettingsPopover";
import { SwitchField } from "@/components/ui/SwitchField";
import { DotsIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { usePersonalInfo } from "@/hooks/store/usePersonalInfo";
import { t } from "@/lib/i18n";
import type { PersonalInfoFieldVisibility } from "@/types";

const FIELD_LABELS: { key: keyof PersonalInfoFieldVisibility; label: string }[] = [
  { key: "jobTitle", label: t.personalInfo.jobTitle },
  { key: "phone", label: t.personalInfo.phone },
  { key: "links", label: t.personalInfo.links },
  { key: "email", label: t.personalInfo.email },
  { key: "location", label: t.personalInfo.location },
  { key: "photo", label: t.personalInfo.profileImage },
  { key: "dateOfBirth", label: t.personalInfo.dateOfBirth },
  { key: "nationality", label: t.personalInfo.nationality },
  { key: "militaryService", label: t.personalInfo.militaryService },
];

interface PersonalInfoSettingsProps {
  triggerSize?: "2xs" | "xs" | "sm";
  /** Light header vs dark band/column — adapts the solid dots chip so it reads. */
  tone?: "onLight" | "onDark";
}

export function PersonalInfoSettings({
  triggerSize = "2xs",
  tone = "onLight",
}: PersonalInfoSettingsProps = {}) {
  const {
    personalInfo,
    toggleField,
    setUppercaseName,
    setPhotoStyle,
    setImageSide,
    addLink,
    removeLink,
  } = usePersonalInfo();

  return (
    <SettingsPopover
      title={t.personalInfo.fields}
      triggerLabel={t.personalInfo.fields}
      triggerSize={triggerSize}
      icon={<DotsIcon />}
      triggerRest={0.55}
      tone={tone}
    >
      <VStack align="stretch" gap="2.5">
        {FIELD_LABELS.map((field) => (
          <SwitchField
            key={field.key}
            label={field.label}
            checked={personalInfo.fieldVisibility[field.key]}
            onChange={() => toggleField(field.key)}
          />
        ))}

        <Separator borderColor="blackAlpha.100" />

        {/* Links are added/removed here (the inline header only displays them). */}
        <Box>
          <Text fontSize="xs" fontWeight="medium" color="fg.muted" mb="2">
            {t.personalInfo.links}
          </Text>
          <VStack align="stretch" gap="1.5">
            {personalInfo.links.map((link) => (
              <HStack key={link.id} gap="1.5">
                <Text fontSize="xs" flex="1" minW="0" lineClamp={1}>
                  {link.label || link.url || t.personalInfo.linkLabel}
                </Text>
                <IconButton
                  aria-label={t.personalInfo.removeLink}
                  size="2xs"
                  variant="ghost"
                  colorPalette="red"
                  borderRadius="md"
                  onClick={() => removeLink(link.id)}
                >
                  <TrashIcon />
                </IconButton>
              </HStack>
            ))}
            <Button size="2xs" variant="ghost" colorPalette="accent" alignSelf="flex-start" onClick={addLink}>
              <PlusIcon />
              {t.personalInfo.addLink}
            </Button>
          </VStack>
        </Box>

        <Separator borderColor="blackAlpha.100" />

        <SwitchField
          label={t.personalInfo.uppercaseName}
          checked={personalInfo.uppercaseName}
          onChange={(checked) => setUppercaseName(checked)}
        />

        <Box>
          <Text fontSize="xs" fontWeight="medium" color="fg.muted" mb="2">
            {t.personalInfo.photoStyle}
          </Text>
          <SegmentGroup.Root
            size="sm"
            width="100%"
            value={personalInfo.photoStyle}
            onValueChange={(details) =>
              setPhotoStyle(
                details.value === "square" || details.value === "sharp"
                  ? details.value
                  : "round",
              )
            }
          >
            <SegmentGroup.Indicator />
            <SegmentGroup.Items
              flex="1"
              items={[
                { value: "round", label: t.personalInfo.photoRound },
                { value: "square", label: t.personalInfo.photoSquare },
                { value: "sharp", label: t.personalInfo.photoSharp },
              ]}
            />
          </SegmentGroup.Root>
        </Box>

        <Box>
          <Text fontSize="xs" fontWeight="medium" color="fg.muted" mb="2">
            {t.personalInfo.imageSide}
          </Text>
          <SegmentGroup.Root
            size="sm"
            width="100%"
            value={personalInfo.imageSide}
            onValueChange={(details) =>
              setImageSide(details.value === "right" ? "right" : "left")
            }
          >
            <SegmentGroup.Indicator />
            <SegmentGroup.Items
              flex="1"
              items={[
                { value: "left", label: t.personalInfo.imageLeft },
                { value: "right", label: t.personalInfo.imageRight },
              ]}
            />
          </SegmentGroup.Root>
        </Box>
      </VStack>
    </SettingsPopover>
  );
}
