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
import { PAGE_MARGIN_MM } from "@/lib/pagination";
import { resumeTextVars } from "@/lib/themes";

interface HeaderBandProps {
  /** Solid band fill (a deep tint of the theme accent). */
  bandColor: string;
  /** Text colour that reads on the band. */
  contrastText: string;
  /** Horizontal (inline) inner padding in millimetres. The vertical padding is the
   *  fixed 16mm page margin, so the band's top edge is the page's top margin. */
  padMm: number;
}

/**
 * Full-width coloured header band (قالب ۴). The identity, contacts and photo are
 * the same editable blocks as every other template; the band overrides the
 * resume text-tier variables to light tints so the job title / contacts read on
 * the dark fill, and the settings gear + hover reveal behave as elsewhere.
 */
export function HeaderBand({ bandColor, contrastText, padMm }: HeaderBandProps) {
  const { personalInfo } = usePersonalInfo();
  const soft = "rgba(255,255,255,0.82)";

  return (
    <Box
      className="group"
      css={SECTION_HOVER_FRAME_REVEAL}
      bg={bandColor}
      color={contrastText}
      paddingBlock={`${PAGE_MARGIN_MM}mm`}
      paddingInline={`${padMm}mm`}
      dir="rtl"
      style={resumeTextVars(contrastText, soft, soft)}
    >
      <HStack align="center" gap="22px" justify="space-between">
        <VStack align="stretch" flex="1" minW="0" gap="12px">
          <PersonalInfoIdentity
            accentColor={contrastText}
            nameColor={contrastText}
            subtitleColor={soft}
            rightSlot={<PersonalInfoSettings triggerSize="2xs" tone="onDark" />}
          />
          <Box borderRadius="md" _groupHover={CONTENT_BORDER_HOVER}>
            <PersonalInfoContacts accentColor={soft} color={soft} />
          </Box>
        </VStack>
        {personalInfo.fieldVisibility.photo ? <ProfileImageEditor size="92px" /> : null}
      </HStack>
    </Box>
  );
}
