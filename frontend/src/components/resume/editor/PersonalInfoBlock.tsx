"use client";

import { memo } from "react";
import { Box, HStack, VStack } from "@chakra-ui/react";
import { useAtsMode } from "@/hooks/store/useAtsMode";
import { usePersonalInfo } from "@/hooks/store/usePersonalInfo";
import { CONTENT_BORDER_HOVER, SECTION_HOVER_FRAME_REVEAL } from "./HoverFrame";
import { PersonalInfoContacts } from "./PersonalInfoContacts";
import { PersonalInfoIdentity } from "./PersonalInfoIdentity";
import { PersonalInfoSettings } from "./PersonalInfoSettings";
import { ProfileImageEditor } from "./ProfileImageEditor";

interface PersonalInfoBlockProps {
  accentColor: string;
  /** Decorative colour for the contact/link icons; unset falls back to the accent. */
  markerColor?: string;
}

export const PersonalInfoBlock = memo(function PersonalInfoBlock({
  accentColor,
  markerColor,
}: PersonalInfoBlockProps) {
  const { personalInfo } = usePersonalInfo();
  // ATS Friendly mode is text-only, so the header photo (an image ATS can't read)
  // is dropped — this only removes height, never adds it.
  const ats = useAtsMode();

  // The photo side is a persisted personal-info setting. The row is RTL, so its
  // first flex child sits at the inline-start (physical RIGHT) and its last child
  // at the inline-end (physical LEFT): "right" ⇒ photo first, "left" (default) ⇒
  // photo last. A width-only swap — the photo and text keep their sizes, so the
  // header's height (and its pagination estimate) is unchanged either way.
  const photo = !ats && personalInfo.fieldVisibility.photo ? <ProfileImageEditor /> : null;
  const photoOnRight = personalInfo.imageSide === "right";

  // Same hover pattern as every section: the name and the inline dots HoverFrame
  // share a space-between row (so the dots sit on the name's baseline), and the
  // contacts beneath are wrapped by the hover content border.
  return (
    <Box className="group" css={SECTION_HOVER_FRAME_REVEAL}>
      <HStack align="flex-start" gap="22px" pb="16px" dir="rtl">
        {photoOnRight ? photo : null}
        <VStack align="stretch" flex="1" minW="0" gap="12px">
          <PersonalInfoIdentity
            accentColor={accentColor}
            markerColor={markerColor}
            rightSlot={<PersonalInfoSettings triggerSize="2xs" />}
          />
          <Box borderRadius="md" _groupHover={CONTENT_BORDER_HOVER}>
            <PersonalInfoContacts accentColor={accentColor} markerColor={markerColor} />
          </Box>
        </VStack>
        {photoOnRight ? null : photo}
      </HStack>
    </Box>
  );
});
