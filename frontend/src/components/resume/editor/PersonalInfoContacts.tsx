"use client";

import { chakra, HStack, VStack, Wrap } from "@chakra-ui/react";
import type { ReactNode } from "react";
import {
  CalendarIcon,
  GlobeIcon,
  MailIcon,
  MapPinIcon,
  MilitaryServiceIcon,
  PhoneIcon,
} from "@/components/ui/icons";
import { useAtsMode } from "@/hooks/store/useAtsMode";
import { usePersonalInfo } from "@/hooks/store/usePersonalInfo";
import { t } from "@/lib/i18n";
import { EditableText } from "./EditableText";
import { LinksEditor } from "./LinksEditor";

interface PersonalInfoContactsProps {
  accentColor: string;
  color?: string;
  /** Cross-row alignment of the wrapped contact chips (e.g. centered header). */
  justify?: "flex-start" | "center";
  /** Decorative colour for the contact/link icons; unset falls back to the accent. */
  markerColor?: string;
  /** Contact-text font size (default `xs`); a template can pin a design's exact scale. */
  contactFontSize?: string;
  /** Inter-chip wrap gaps (column, row). Default to the shared `2`/`1` rhythm. */
  gapX?: string;
  gapY?: string;
  /** Icon-to-text gap inside each contact item (default `1`). */
  itemGap?: string;
  /**
   * Render the items as a ONE-PER-ROW column (`gapY` between rows) instead of the
   * wrapping row. The timeline-panel design's side panel stacks its contacts, and
   * a narrow column can't be relied on to wrap them one-per-row on its own.
   * Item ORDER and the visibility rules are identical in both modes, so hiding a
   * field can never reorder the rest or strand a separator.
   */
  stack?: boolean;
  /** Contact-glyph size (default `0.95em`), so a design can pin its icon scale. */
  iconSize?: string;
  /**
   * Where the links render among the contact items. The shared default keeps
   * them LAST (today's order everywhere); "afterEmail" is the timeline-panel
   * reference's phone → email → links → location sequence. Visibility rules are
   * identical in both positions.
   */
  linksPosition?: "end" | "afterEmail";
}

interface ContactFieldProps {
  icon: ReactNode;
  iconColor: string;
  /** Icon-to-text gap (default `1`); a template can pin the reference's exact value. */
  gap?: string;
  /** Glyph size (default `0.95em`). */
  iconSize?: string;
  children: ReactNode;
}

function ContactField({ icon, iconColor, gap = "1", iconSize = "0.95em", children }: ContactFieldProps) {
  return (
    <HStack gap={gap} minW="0">
      {/* ATS Friendly mode passes a null icon — the leading glyph is dropped and
          only the contact text remains. */}
      {icon ? (
        <chakra.span fontSize={iconSize} color={iconColor} flexShrink={0} display="inline-flex">
          {icon}
        </chakra.span>
      ) : null}
      {children}
    </HStack>
  );
}

export function PersonalInfoContacts({
  accentColor,
  color = "#52525b",
  justify = "flex-start",
  markerColor,
  contactFontSize = "xs",
  gapX = "2",
  gapY = "1",
  itemGap = "1",
  stack = false,
  iconSize,
  linksPosition = "end",
}: PersonalInfoContactsProps) {
  const { personalInfo, updatePersonalInfo } = usePersonalInfo();
  const { fieldVisibility } = personalInfo;
  const ats = useAtsMode();
  const iconColor = markerColor ?? accentColor;

  // ONE list, ONE order — only the container differs, so the stacked panel and the
  // wrapping header can never drift apart in item order or visibility rules. A
  // hidden field renders nothing at all (no wrapper, no separator), so collapsing
  // one leaves the remaining items in exactly the same sequence. The links node
  // is built once and slotted at the requested position.
  const links = fieldVisibility.links ? (
    <LinksEditor accentColor={accentColor} markerColor={markerColor} inputEllipsis={stack} />
  ) : null;
  const items = (
    <>
      {fieldVisibility.phone ? (
        <ContactField icon={ats ? null : <PhoneIcon />} iconColor={iconColor} gap={itemGap} iconSize={iconSize}>
          <EditableText
            value={personalInfo.phone}
            onChange={(value) => updatePersonalInfo({ phone: value })}
            placeholder={t.personalInfo.phonePlaceholder}
            validate
            fontSize={contactFontSize}
            color={color}
            // Narrow stacked panel: the editor input end-ellipsizes instead of
            // hard-clipping a long value mid-character; print still wraps.
            inputEllipsis={stack}
          />
        </ContactField>
      ) : null}
      {fieldVisibility.email ? (
        <ContactField icon={ats ? null : <MailIcon />} iconColor={iconColor} gap={itemGap} iconSize={iconSize}>
          <EditableText
            value={personalInfo.email}
            onChange={(value) => updatePersonalInfo({ email: value })}
            placeholder={t.personalInfo.emailPlaceholder}
            validate
            fontSize={contactFontSize}
            color={color}
            // Narrow stacked panel: the editor input end-ellipsizes instead of
            // hard-clipping a long value mid-character; print still wraps.
            inputEllipsis={stack}
          />
        </ContactField>
      ) : null}
      {linksPosition === "afterEmail" ? links : null}
      {fieldVisibility.location ? (
        <ContactField icon={ats ? null : <MapPinIcon />} iconColor={iconColor} gap={itemGap} iconSize={iconSize}>
          <EditableText
            value={personalInfo.location}
            onChange={(value) => updatePersonalInfo({ location: value })}
            placeholder={t.personalInfo.locationPlaceholder}
            validate
            fontSize={contactFontSize}
            color={color}
            // Narrow stacked panel: the editor input end-ellipsizes instead of
            // hard-clipping a long value mid-character; print still wraps.
            inputEllipsis={stack}
          />
        </ContactField>
      ) : null}
      {fieldVisibility.dateOfBirth ? (
        <ContactField icon={ats ? null : <CalendarIcon />} iconColor={iconColor} gap={itemGap} iconSize={iconSize}>
          <EditableText
            value={personalInfo.dateOfBirth}
            onChange={(value) => updatePersonalInfo({ dateOfBirth: value })}
            placeholder={t.personalInfo.dateOfBirthPlaceholder}
            validate
            fontSize={contactFontSize}
            color={color}
            // Narrow stacked panel: the editor input end-ellipsizes instead of
            // hard-clipping a long value mid-character; print still wraps.
            inputEllipsis={stack}
          />
        </ContactField>
      ) : null}
      {fieldVisibility.nationality ? (
        <ContactField icon={ats ? null : <GlobeIcon />} iconColor={iconColor} gap={itemGap} iconSize={iconSize}>
          <EditableText
            value={personalInfo.nationality}
            onChange={(value) => updatePersonalInfo({ nationality: value })}
            placeholder={t.personalInfo.nationalityPlaceholder}
            validate
            fontSize={contactFontSize}
            color={color}
            // Narrow stacked panel: the editor input end-ellipsizes instead of
            // hard-clipping a long value mid-character; print still wraps.
            inputEllipsis={stack}
          />
        </ContactField>
      ) : null}
      {fieldVisibility.militaryService ? (
        <ContactField icon={ats ? null : <MilitaryServiceIcon />} iconColor={iconColor} gap={itemGap} iconSize={iconSize}>
          <EditableText
            value={personalInfo.militaryService}
            onChange={(value) => updatePersonalInfo({ militaryService: value })}
            placeholder={t.personalInfo.militaryServicePlaceholder}
            validate
            fontSize={contactFontSize}
            color={color}
            // Narrow stacked panel: the editor input end-ellipsizes instead of
            // hard-clipping a long value mid-character; print still wraps.
            inputEllipsis={stack}
          />
        </ContactField>
      ) : null}
      {linksPosition === "end" ? links : null}
    </>
  );

  return stack ? (
    <VStack align="stretch" gap={gapY}>
      {items}
    </VStack>
  ) : (
    <Wrap gapX={gapX} gapY={gapY} align="center" justify={justify}>
      {items}
    </Wrap>
  );
}
