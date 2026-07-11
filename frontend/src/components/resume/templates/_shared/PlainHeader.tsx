"use client";

import { Box, HStack, VStack } from "@chakra-ui/react";
import {
  CONTENT_BORDER_HOVER,
  SECTION_HOVER_FRAME_REVEAL,
} from "@/components/resume/editor/HoverFrame";
import { PersonalInfoContacts } from "@/components/resume/editor/PersonalInfoContacts";
import { PersonalInfoIdentity } from "@/components/resume/editor/PersonalInfoIdentity";
import { PersonalInfoSettings } from "@/components/resume/editor/PersonalInfoSettings";
import { ProfileImageEditor } from "@/components/resume/editor/ProfileImageEditor";
import { usePersonalInfo } from "@/hooks/store/usePersonalInfo";

interface PlainHeaderProps {
  accentColor: string;
  nameColor?: string;
  subtitleColor?: string;
  /** Show the photo beside the identity (also honours the photo visibility toggle). */
  showPhoto?: boolean;
  /** Show the inline contact row (hidden when the contacts live in an aside). */
  showContacts?: boolean;
  /** Draw a hairline divider beneath the header. */
  divider?: boolean;
  photoSize?: string;
  /** Decorative colour for the contact/link icons; unset falls back to the accent. */
  markerColor?: string;
}

/**
 * A flat header for the column/single templates: the same editable identity
 * ({@link PersonalInfoIdentity}), contacts and photo as the original
 * {@link PersonalInfoBlock} — with the same hover reveal + settings gear — but
 * with the photo / contacts / divider toggled per template.
 */
export function PlainHeader({
  accentColor,
  nameColor,
  subtitleColor,
  showPhoto = true,
  showContacts = true,
  divider = false,
  photoSize = "86px",
  markerColor,
}: PlainHeaderProps) {
  const { personalInfo } = usePersonalInfo();
  const withPhoto = showPhoto && personalInfo.fieldVisibility.photo;

  return (
    <Box className="group" css={SECTION_HOVER_FRAME_REVEAL} dir="rtl">
      <HStack
        align="flex-start"
        gap="22px"
        pb={divider ? "4" : "0"}
        borderBottomWidth={divider ? "1px" : undefined}
        borderColor="blackAlpha.200"
      >
        <VStack align="stretch" flex="1" minW="0" gap="12px">
          <PersonalInfoIdentity
            accentColor={accentColor}
            nameColor={nameColor}
            subtitleColor={subtitleColor}
            markerColor={markerColor}
            rightSlot={<PersonalInfoSettings triggerSize="2xs" />}
          />
          {showContacts ? (
            <Box borderRadius="md" _groupHover={CONTENT_BORDER_HOVER}>
              <PersonalInfoContacts accentColor={accentColor} markerColor={markerColor} />
            </Box>
          ) : null}
        </VStack>
        {withPhoto ? <ProfileImageEditor size={photoSize} /> : null}
      </HStack>
    </Box>
  );
}
