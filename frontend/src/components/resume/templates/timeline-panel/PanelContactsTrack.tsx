"use client";

import { Box, Heading } from "@chakra-ui/react";
import {
  CONTENT_BORDER_HOVER,
  SECTION_HOVER_FRAME_REVEAL,
} from "@/components/resume/editor/HoverFrame";
import { PersonalInfoContacts } from "@/components/resume/editor/PersonalInfoContacts";
import { t } from "@/lib/i18n";
import { SECTION_TITLE_PAD_EM } from "@/lib/pagination";
import {
  CONTACT_FS,
  CONTACT_ICON_FS,
  CONTACT_ICON_GAP,
  CONTACT_ROW_GAP,
  PANEL_RAIL,
  PANEL_SECTION_TRAILING_PX,
  PANEL_TITLE_FS,
  PANEL_TITLE_TRACKING,
  PANEL_TITLE_WEIGHT,
} from "./tokens";
import { TimelineTrack, type RailTail } from "./TimelineTrack";

interface PanelContactsTrackProps {
  /** «تماس» heading colour — the panel's own heading tier. */
  headingColor: string;
  /** Contact text colour on the panel wash. */
  textColor: string;
  /** Contact-glyph colour (the reference paints them in the heading ink). */
  iconColor: string;
  lineColor: string;
  dotColor: string;
  dotFill: string;
  tail: RailTail;
  gapBelowMm: number;
}

/**
 * The panel's contact block, drawn exactly as the reference draws it: a titled
 * timeline track («تماس») whose marker opens the panel's rail, over a ONE-PER-ROW
 * list of contact items — glyph, then value, at the reference's 13px icon / 8px
 * gap / 11.5px text / 9px row rhythm.
 *
 * The items themselves are the shared {@link PersonalInfoContacts} in its stacked
 * mode, so the ORDER, the per-field visibility toggles and the inline editing are
 * identical to every other template: hiding a field removes its row and nothing
 * else — no gap is left behind and the remaining rows keep their sequence, because
 * the rows carry no separators and the flex gap only applies between rendered
 * children.
 *
 * The title row reproduces {@link SectionFrame}'s own model (symmetric
 * {@link SECTION_TITLE_PAD_EM} pads, a tight 1.15 heading line box, a 2px gap to
 * the content) so this track's heading sits on exactly the same baseline as the
 * real sections beneath it and its marker lands at the same offset.
 */
export function PanelContactsTrack({
  headingColor,
  textColor,
  iconColor,
  lineColor,
  dotColor,
  dotFill,
  tail,
  gapBelowMm,
}: PanelContactsTrackProps) {
  return (
    <TimelineTrack
      rail={PANEL_RAIL}
      lineColor={lineColor}
      dotColor={dotColor}
      dotFill={dotFill}
      titled
      tail={tail}
      gapBelowMm={gapBelowMm}
    >
      <Box className="group" css={SECTION_HOVER_FRAME_REVEAL} dir="rtl">
        <Box pt={`${SECTION_TITLE_PAD_EM}em`} pb={`${SECTION_TITLE_PAD_EM}em`}>
          <Heading
            as="h2"
            fontSize={PANEL_TITLE_FS}
            fontWeight={PANEL_TITLE_WEIGHT}
            letterSpacing={PANEL_TITLE_TRACKING}
            lineHeight="1.15"
            marginBlock="0"
            color={headingColor}
          >
            {t.personalInfo.contactsTitle}
          </Heading>
        </Box>
        <Box
          mt="0.5"
          pb={`${PANEL_SECTION_TRAILING_PX}px`}
          borderRadius="md"
          _groupHover={CONTENT_BORDER_HOVER}
        >
          <PersonalInfoContacts
            stack
            accentColor={iconColor}
            markerColor={iconColor}
            color={textColor}
            contactFontSize={CONTACT_FS}
            iconSize={CONTACT_ICON_FS}
            itemGap={CONTACT_ICON_GAP}
            gapY={CONTACT_ROW_GAP}
            // Reference order: phone → email → website → location.
            linksPosition="afterEmail"
          />
        </Box>
      </Box>
    </TimelineTrack>
  );
}
