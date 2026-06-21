"use client";

import { Box, SegmentGroup, Separator, Text, VStack } from "@chakra-ui/react";
import { SettingsPopover } from "@/components/ui/SettingsPopover";
import { SwitchField } from "@/components/ui/SwitchField";
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
];

export function PersonalInfoSettings() {
  const { personalInfo, toggleField, setUppercaseName, setPhotoStyle } = usePersonalInfo();

  return (
    <SettingsPopover title={t.personalInfo.fields} triggerLabel={t.personalInfo.fields}>
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
              setPhotoStyle(details.value === "square" ? "square" : "round")
            }
          >
            <SegmentGroup.Indicator />
            <SegmentGroup.Items
              flex="1"
              items={[
                { value: "round", label: t.personalInfo.photoRound },
                { value: "square", label: t.personalInfo.photoSquare },
              ]}
            />
          </SegmentGroup.Root>
        </Box>
      </VStack>
    </SettingsPopover>
  );
}
