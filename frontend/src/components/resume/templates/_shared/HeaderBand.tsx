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
import { resumeTextVars } from "@/lib/themes";

interface HeaderBandProps {
  /** Card fill — a light wash of the theme accent, matching the section-icon chips. */
  cardBg: string;
  /** Name colour (the card's primary tier), chosen for the fill's luminance. */
  heading: string;
  /** Job-title colour. */
  titleColor: string;
  /** Contact-text colour (a touch deeper than the title, per the reference). */
  contactColor: string;
  /** Contact-icon colour (a touch lighter than the contact text, per the reference). */
  iconColor: string;
  /** Placeholder colour for empty fields on the card, so they stay visible. */
  placeholder: string;
  /** Whether the card reads as dark — adapts the settings-gear chip so it stays legible. */
  tone: "onLight" | "onDark";
}

// Structural metrics taken verbatim from the reference (Resume.dc.html header).
// An A4 page is ~794px wide at 96dpi in both the reference and this app, so the
// reference px map 1:1 onto the A4 surface; type sizes are expressed in em ÷ the
// 15px page base so they stay pixel-exact at scale 1.0 while tracking the font
// slider, and structural chrome (card radius/padding, photo ring, decorative
// circle) stays in px because it is fixed geometry, not scalable text.
const CARD_RADIUS = "14px";
const CARD_PAD_BLOCK = "18px";
const CARD_PAD_INLINE = "22px";
const CARD_GAP = "20px"; // content ↔ photo
const IDENTITY_TO_CONTACTS_GAP = "13px";
const NAME_FS = "1.533em"; // 23px
const TITLE_FS = "0.867em"; // 13px
const CONTACT_FS = "2xs"; // 0.7em → 10.5px
const CONTACT_GAP_X = "18px";
const CONTACT_GAP_Y = "9px";
const CONTACT_ICON_GAP = "5px"; // icon → text, per the reference
const PHOTO_OUTER = "120px";
const PHOTO_RING = "3px";
const PHOTO_INNER = "115px"; // 86 − 2×3 ring (box-sizing:border-box in the reference)

/**
 * The header of the "header-band" template (قالب ۴): a full-width, page-margin-
 * inset rounded CARD holding the identity, contacts and photo, exactly as the
 * reference draws it — a soft decorative circle bleeds behind the name, the photo
 * sits in a white ring on the inline-end, and the whole card is a light wash of
 * the theme accent so it recolours with the résumé's palette. The identity,
 * contacts and photo are the same editable blocks every template uses; the card
 * only overrides their sizes/tiers to the reference's metrics and paints the
 * card chrome around them. The settings gear + hover reveal behave as elsewhere.
 */
export function HeaderBand({
  cardBg,
  heading,
  titleColor,
  contactColor,
  iconColor,
  placeholder,
  tone,
}: HeaderBandProps) {
  const { personalInfo } = usePersonalInfo();

  return (
    <Box
      className="group"
      css={SECTION_HOVER_FRAME_REVEAL}
      position="relative"
      overflow="hidden"
      bg={cardBg}
      color={heading}
      borderRadius={CARD_RADIUS}
      paddingBlock={CARD_PAD_BLOCK}
      paddingInline={CARD_PAD_INLINE}
      dir="rtl"
      style={resumeTextVars(heading, contactColor, titleColor, placeholder)}
    >
      {/* Soft decorative disc bleeding off the top inline-start (right in RTL,
          matching the reference's `right:-34px; top:-52px`), clipped by the
          card's rounded overflow. Tone-adaptive white/near-white alpha. */}
      <Box
        aria-hidden="true"
        position="absolute"
        insetInlineStart="-34px"
        top="-52px"
        width="150px"
        height="150px"
        borderRadius="full"
        bg={tone === "onDark" ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.32)"}
        pointerEvents="none"
      />
      <HStack align="center" gap={CARD_GAP} justify="space-between" position="relative" zIndex={1}>
        <VStack align="stretch" flex="1" minW="0" gap={IDENTITY_TO_CONTACTS_GAP}>
          <PersonalInfoIdentity
            accentColor={heading}
            nameColor={heading}
            subtitleColor={titleColor}
            nameFontSize={NAME_FS}
            subtitleFontSize={TITLE_FS}
            subtitleFontWeight="medium"
            rightSlot={<PersonalInfoSettings triggerSize="2xs" tone={tone} />}
          />
          <Box borderRadius="md" _groupHover={CONTENT_BORDER_HOVER}>
            <PersonalInfoContacts
              accentColor={iconColor}
              color={contactColor}
              markerColor={iconColor}
              contactFontSize={CONTACT_FS}
              gapX={CONTACT_GAP_X}
              gapY={CONTACT_GAP_Y}
              itemGap={CONTACT_ICON_GAP}
            />
          </Box>
        </VStack>
        {personalInfo.fieldVisibility.photo ? (
          <Box
            flexShrink={0}
            borderRadius="full"
            bg="#ffffff"
            padding={PHOTO_RING}
            width={PHOTO_OUTER}
            height={PHOTO_OUTER}
            boxShadow="0 3px 10px rgba(46,58,36,0.12)"
          >
            <ProfileImageEditor size={PHOTO_INNER} />
          </Box>
        ) : null}
      </HStack>
    </Box>
  );
}
