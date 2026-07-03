"use client";

import { Box, VStack } from "@chakra-ui/react";
import { EditableText } from "@/components/resume/editor/EditableText";
import {
  CONTENT_BORDER_HOVER,
  SECTION_HOVER_FRAME_REVEAL,
} from "@/components/resume/editor/HoverFrame";
import { PersonalInfoContacts } from "@/components/resume/editor/PersonalInfoContacts";
import { PersonalInfoSettings } from "@/components/resume/editor/PersonalInfoSettings";
import { ProfileImageEditor } from "@/components/resume/editor/ProfileImageEditor";
import { usePersonalInfo } from "@/hooks/store/usePersonalInfo";
import { t } from "@/lib/i18n";

interface CenteredHeaderProps {
  accentColor: string;
  /** Fallback subtitle tint (the page also supplies --rz-subtitle). */
  subtitleColor: string;
}

/**
 * Centered classic header (قالب ۷): the name, job title and contacts are centre
 * aligned. Built from the same editable fields as the other headers (so inline
 * editing, the settings gear, photo upload and hover reveal all carry over),
 * just centred via the new textAlign / justify options.
 */
export function CenteredHeader({ accentColor, subtitleColor }: CenteredHeaderProps) {
  const { personalInfo, updatePersonalInfo } = usePersonalInfo();
  const { fieldVisibility } = personalInfo;

  return (
    <Box className="group" css={SECTION_HOVER_FRAME_REVEAL} position="relative" dir="rtl">
      <Box position="absolute" top="0" insetInlineEnd="0">
        <PersonalInfoSettings triggerSize="2xs" />
      </Box>
      <VStack gap="2" align="center">
        {fieldVisibility.photo ? <ProfileImageEditor size="86px" /> : null}
        <Box width="100%" maxW="78%" letterSpacing="-0.02em">
          <EditableText
            value={personalInfo.fullName}
            onChange={(value) => updatePersonalInfo({ fullName: value })}
            placeholder={t.personalInfo.fullNamePlaceholder}
            fontSize="2xl"
            fontWeight="bold"
            color={accentColor}
            textAlign="center"
            textTransform={personalInfo.uppercaseName ? "uppercase" : "none"}
          />
        </Box>
        {fieldVisibility.jobTitle ? (
          <Box width="100%" maxW="78%">
            <EditableText
              value={personalInfo.jobTitle}
              onChange={(value) => updatePersonalInfo({ jobTitle: value })}
              placeholder={t.personalInfo.jobTitlePlaceholder}
              fontSize="md"
              fontWeight="bold"
              color={`var(--rz-subtitle, ${subtitleColor})`}
              textAlign="center"
            />
          </Box>
        ) : null}
        <Box borderRadius="md" _groupHover={CONTENT_BORDER_HOVER}>
          <PersonalInfoContacts accentColor={accentColor} justify="center" />
        </Box>
      </VStack>
    </Box>
  );
}
