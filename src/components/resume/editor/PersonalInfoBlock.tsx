"use client";

import { memo } from "react";
import { Box, HStack, VStack } from "@chakra-ui/react";
import { usePersonalInfo } from "@/hooks/store/usePersonalInfo";
import { PersonalInfoContacts } from "./PersonalInfoContacts";
import { PersonalInfoIdentity } from "./PersonalInfoIdentity";
import { ProfileImageEditor } from "./ProfileImageEditor";

interface PersonalInfoBlockProps {
  accentColor: string;
}

export const PersonalInfoBlock = memo(function PersonalInfoBlock({
  accentColor,
}: PersonalInfoBlockProps) {
  const { personalInfo } = usePersonalInfo();

  return (
    <HStack
      align="flex-start"
      gap="22px"
      pb="22px"
      dir="rtl"
    >
      {personalInfo.fieldVisibility.photo ? <ProfileImageEditor /> : null}
      <VStack align="stretch" flex="1" minW="0" gap="16px">
        <PersonalInfoIdentity accentColor={accentColor} />
        <Box>
          <PersonalInfoContacts accentColor={accentColor} />
        </Box>
      </VStack>
    </HStack>
  );
});
