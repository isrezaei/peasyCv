"use client";

import { Box, HStack, VStack } from "@chakra-ui/react";
import { usePersonalInfo } from "@/hooks/store/usePersonalInfo";
import { t } from "@/lib/i18n";
import { EditableText } from "./EditableText";
import { PersonalInfoSettings } from "./PersonalInfoSettings";
import { SecondaryTitleField } from "./SecondaryTitleField";

interface PersonalInfoIdentityProps {
  accentColor: string;
  nameColor?: string;
  subtitleColor?: string;
}

export function PersonalInfoIdentity({
  accentColor,
  nameColor,
  subtitleColor,
}: PersonalInfoIdentityProps) {
  const { personalInfo, updatePersonalInfo } = usePersonalInfo();
  const { fieldVisibility } = personalInfo;

  return (
    <VStack align="stretch" gap="0.5" flex="1" minW="0">
      <HStack gap="1" align="center">
        {/* letter-spacing is inherited by the inner input — tight negative
            tracking on the large name per the 2026 reference. */}
        <Box flex="1" minW="0" letterSpacing="-0.025em">
          <EditableText
            value={personalInfo.fullName}
            onChange={(value) => updatePersonalInfo({ fullName: value })}
            placeholder={t.personalInfo.fullNamePlaceholder}
            fontSize="2xl"
            fontWeight="bold"
            color={nameColor ?? "#18181b"}
            textTransform={personalInfo.uppercaseName ? "uppercase" : "none"}
          />
        </Box>
        <PersonalInfoSettings />
      </HStack>
      {fieldVisibility.jobTitle ? (
        // The job title is the header's secondary title — it follows the RESUME
        // accent like every other section's subtitle (company, university).
        <SecondaryTitleField
          value={personalInfo.jobTitle}
          onChange={(value) => updatePersonalInfo({ jobTitle: value })}
          placeholder={t.personalInfo.jobTitlePlaceholder}
          accentColor={subtitleColor ?? accentColor}
          fontSize="md"
        />
      ) : null}
    </VStack>
  );
}
