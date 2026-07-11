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
  /** Band fill — a light tint of the theme secondary, matching the coloured columns. */
  bandColor: string;
  /** Readable colour for the name (the band's primary tier), chosen for the fill's luminance. */
  heading: string;
  /** Readable colour for the job title + contacts (and their icons) on the fill. */
  subtitle: string;
  /** Placeholder colour for empty fields on the band, so they stay visible. */
  placeholder: string;
  /** Whether the band reads as dark — adapts the settings-gear chip so it stays legible. */
  tone: "onLight" | "onDark";
  /** Horizontal (inline) inner padding in millimetres. The vertical padding is the
   *  fixed 16mm page margin, so the band's top edge is the page's top margin. */
  padMm: number;
}

/**
 * Full-width coloured header band (قالب ۴). The identity, contacts and photo are
 * the same editable blocks as every other template; the band overrides the resume
 * text-tier variables to the caller's adaptive tiers so the name, job title and
 * contacts — AND the placeholder text of empty fields — stay readable whether the
 * tint lands light or dark. The settings gear + hover reveal behave as elsewhere.
 */
export function HeaderBand({ bandColor, heading, subtitle, placeholder, tone, padMm }: HeaderBandProps) {
  const { personalInfo } = usePersonalInfo();

  return (
    <Box
      className="group"
      css={SECTION_HOVER_FRAME_REVEAL}
      bg={bandColor}
      color={heading}
      paddingBlock={`${PAGE_MARGIN_MM}mm`}
      paddingInline={`${padMm}mm`}
      dir="rtl"
      style={resumeTextVars(heading, subtitle, subtitle, placeholder)}
    >
      <HStack align="center" gap="22px" justify="space-between">
        <VStack align="stretch" flex="1" minW="0" gap="12px">
          <PersonalInfoIdentity
            accentColor={heading}
            nameColor={heading}
            subtitleColor={subtitle}
            rightSlot={<PersonalInfoSettings triggerSize="2xs" tone={tone} />}
          />
          <Box borderRadius="md" _groupHover={CONTENT_BORDER_HOVER}>
            <PersonalInfoContacts accentColor={subtitle} color={subtitle} />
          </Box>
        </VStack>
        {personalInfo.fieldVisibility.photo ? <ProfileImageEditor size="92px" /> : null}
      </HStack>
    </Box>
  );
}
