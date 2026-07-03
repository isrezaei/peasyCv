"use client";

import { memo } from "react";
import { Box, HStack, VStack } from "@chakra-ui/react";
import { usePersonalInfo } from "@/hooks/store/usePersonalInfo";
import { CONTENT_BORDER_HOVER, SECTION_HOVER_FRAME_REVEAL } from "./HoverFrame";
import { PersonalInfoContacts } from "./PersonalInfoContacts";
import { PersonalInfoIdentity } from "./PersonalInfoIdentity";
import { PersonalInfoSettings } from "./PersonalInfoSettings";
import { ProfileImageEditor } from "./ProfileImageEditor";

interface PersonalInfoBlockProps {
  accentColor: string;
}

export const PersonalInfoBlock = memo(function PersonalInfoBlock({
  accentColor,
}: PersonalInfoBlockProps) {
  const { personalInfo } = usePersonalInfo();

  // Same hover pattern as every section: the name and the inline dots HoverFrame
  // share a space-between row (so the dots sit on the name's baseline), and the
  // contacts beneath are wrapped by the hover content border.
  return (
    <Box className="group" css={SECTION_HOVER_FRAME_REVEAL}>
      <HStack align="flex-start" gap="22px" pb="16px" dir="rtl">
        {personalInfo.fieldVisibility.photo ? <ProfileImageEditor /> : null}
        <VStack align="stretch" flex="1" minW="0" gap="12px">
          <PersonalInfoIdentity
            accentColor={accentColor}
            rightSlot={<PersonalInfoSettings triggerSize="2xs" />}
          />
          <Box borderRadius="md" _groupHover={CONTENT_BORDER_HOVER}>
            <PersonalInfoContacts accentColor={accentColor} />
          </Box>
        </VStack>
      </HStack>
    </Box>
  );
});
