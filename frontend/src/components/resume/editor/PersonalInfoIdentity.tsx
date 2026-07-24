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
  /** Name font size (default `2xl`) and weight (default `bold`); a template can pin
   *  the header's exact scale — the timeline-panel design's display name is 900. */
  nameFontSize?: string;
  nameFontWeight?: string;
  /** Job-title font size (default `md`) and weight (default `bold`) so a template
   *  can match a design's lighter, smaller header sub-title. */
  subtitleFontSize?: string;
  subtitleFontWeight?: string;
  /** Name→job-title gap (default `0.5`, i.e. 2px); the timeline-panel design's is 7px. */
  gap?: string;
  /** Line box of the NAME (default: the theme line-height). A display-size name
   *  needs a tight box — the reference's 1.04 — or it reserves a whole airy line. */
  nameLineHeight?: string;
  /** Tracking of the name (default the shared tight `-0.025em`) and of the job
   *  title (default: inherited). Both are inherited by the underlying input. */
  nameLetterSpacing?: string;
  subtitleLetterSpacing?: string;
}

export function PersonalInfoIdentity({
  accentColor,
  nameColor,
  subtitleColor,
  markerColor,
  rightSlot,
  nameFontSize = "2xl",
  nameFontWeight = "bold",
  subtitleFontSize = "md",
  subtitleFontWeight,
  gap = "0.5",
  nameLineHeight,
  nameLetterSpacing = "-0.025em",
  subtitleLetterSpacing,
}: PersonalInfoIdentityProps) {
  const { personalInfo, updatePersonalInfo } = usePersonalInfo();
  const { fieldVisibility } = personalInfo;

  return (
    <VStack align="stretch" gap={gap} flex="1" minW="0">
      {/* Name row: name on one side, the settings element on the other (space-between). */}
      <HStack gap="2" align="center" justify="space-between">
        {/* line-height IS inherited by the inner input; letter-spacing is NOT
            (the UA resets it on form controls), so the tracking is passed to the
            field itself — tight negative tracking on the large name per the 2026
            reference. */}
        <Box flex="1" minW="0" lineHeight={nameLineHeight}>
          <EditableText
            value={personalInfo.fullName}
            onChange={(value) => updatePersonalInfo({ fullName: value })}
            placeholder={t.personalInfo.fullNamePlaceholder}
            // The name is always required — an unnamed résumé silently loses its
            // header title.
            validate
            fontSize={nameFontSize}
            fontWeight={nameFontWeight}
            letterSpacing={nameLetterSpacing}
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
          fontSize={subtitleFontSize}
          fontWeight={subtitleFontWeight}
          letterSpacing={subtitleLetterSpacing}
          // Rendered only while the jobTitle toggle is on — so it is enabled here.
          validate
        />
      ) : null}
    </VStack>
  );
}
