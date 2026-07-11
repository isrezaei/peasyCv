"use client";

import type { ReactNode } from "react";
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
  /** Colour for the sub-heading under the name (the vivid marker/secondary).
   *  Unset keeps the classic `--rz-subtitle` source. The NAME never takes it. */
  markerColor?: string;
  /**
   * Element placed at the end of the NAME row (space-between with the name).
   * PersonalInfoBlock passes the inline HoverFrame here; when omitted the sidebar
   * keeps a plain inline settings gear.
   */
  rightSlot?: ReactNode;
}

export function PersonalInfoIdentity({
  accentColor,
  nameColor,
  subtitleColor,
  markerColor,
  rightSlot,
}: PersonalInfoIdentityProps) {
  const { personalInfo, updatePersonalInfo } = usePersonalInfo();
  const { fieldVisibility } = personalInfo;

  return (
    <VStack align="stretch" gap="0.5" flex="1" minW="0">
      {/* Name row: name on one side, the settings element on the other (space-between). */}
      <HStack gap="2" align="center" justify="space-between">
        {/* letter-spacing is inherited by the inner input — tight negative
            tracking on the large name per the 2026 reference. */}
        <Box flex="1" minW="0" letterSpacing="-0.025em">
          <EditableText
            value={personalInfo.fullName}
            onChange={(value) => updatePersonalInfo({ fullName: value })}
            placeholder={t.personalInfo.fullNamePlaceholder}
            fontSize="2xl"
            fontWeight="bold"
            // The name is the header's PRIMARY title — it follows the resume accent
            // like every other section's primary title (not a fixed near-black).
            color={nameColor ?? accentColor}
            textTransform={personalInfo.uppercaseName ? "uppercase" : "none"}
          />
        </Box>
        {rightSlot ?? <PersonalInfoSettings />}
      </HStack>
      {fieldVisibility.jobTitle ? (
        // The job title is the header's secondary title — it follows the RESUME
        // accent like every other section's subtitle (company, university).
        <SecondaryTitleField
          value={personalInfo.jobTitle}
          onChange={(value) => updatePersonalInfo({ jobTitle: value })}
          placeholder={t.personalInfo.jobTitlePlaceholder}
          accentColor={subtitleColor ?? accentColor}
          markerColor={markerColor}
          fontSize="md"
        />
      ) : null}
    </VStack>
  );
}
