"use client";

import { chakra, HStack, Wrap } from "@chakra-ui/react";
import type { ReactNode } from "react";
import {
  CalendarIcon,
  GlobeIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from "@/components/ui/icons";
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
}

interface ContactFieldProps {
  icon: ReactNode;
  iconColor: string;
  children: ReactNode;
}

function ContactField({ icon, iconColor, children }: ContactFieldProps) {
  return (
    <HStack gap="1" minW="0">
      <chakra.span fontSize="0.95em" color={iconColor} flexShrink={0} display="inline-flex">
        {icon}
      </chakra.span>
      {children}
    </HStack>
  );
}

export function PersonalInfoContacts({
  accentColor,
  color = "#52525b",
  justify = "flex-start",
  markerColor,
}: PersonalInfoContactsProps) {
  const { personalInfo, updatePersonalInfo } = usePersonalInfo();
  const { fieldVisibility } = personalInfo;
  const iconColor = markerColor ?? accentColor;

  return (
    <Wrap gapX="2" gapY="1" align="center" justify={justify}>
      {fieldVisibility.phone ? (
        <ContactField icon={<PhoneIcon />} iconColor={iconColor}>
          <EditableText
            value={personalInfo.phone}
            onChange={(value) => updatePersonalInfo({ phone: value })}
            placeholder={t.personalInfo.phonePlaceholder}
            fontSize="xs"
            color={color}
          />
        </ContactField>
      ) : null}
      {fieldVisibility.email ? (
        <ContactField icon={<MailIcon />} iconColor={iconColor}>
          <EditableText
            value={personalInfo.email}
            onChange={(value) => updatePersonalInfo({ email: value })}
            placeholder={t.personalInfo.emailPlaceholder}
            fontSize="xs"
            color={color}
          />
        </ContactField>
      ) : null}
      {fieldVisibility.location ? (
        <ContactField icon={<MapPinIcon />} iconColor={iconColor}>
          <EditableText
            value={personalInfo.location}
            onChange={(value) => updatePersonalInfo({ location: value })}
            placeholder={t.personalInfo.locationPlaceholder}
            fontSize="xs"
            color={color}
          />
        </ContactField>
      ) : null}
      {fieldVisibility.dateOfBirth ? (
        <ContactField icon={<CalendarIcon />} iconColor={iconColor}>
          <EditableText
            value={personalInfo.dateOfBirth}
            onChange={(value) => updatePersonalInfo({ dateOfBirth: value })}
            placeholder={t.personalInfo.dateOfBirthPlaceholder}
            fontSize="xs"
            color={color}
          />
        </ContactField>
      ) : null}
      {fieldVisibility.nationality ? (
        <ContactField icon={<GlobeIcon />} iconColor={iconColor}>
          <EditableText
            value={personalInfo.nationality}
            onChange={(value) => updatePersonalInfo({ nationality: value })}
            placeholder={t.personalInfo.nationalityPlaceholder}
            fontSize="xs"
            color={color}
          />
        </ContactField>
      ) : null}
      {fieldVisibility.links ? <LinksEditor accentColor={accentColor} markerColor={markerColor} /> : null}
    </Wrap>
  );
}
