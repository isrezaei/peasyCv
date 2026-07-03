"use client";

import { chakra, HStack, Wrap } from "@chakra-ui/react";
import { LinkIcon } from "@/components/ui/icons";
import { usePersonalInfo } from "@/hooks/store/usePersonalInfo";
import { t } from "@/lib/i18n";
import { EditableText } from "./EditableText";

interface LinksEditorProps {
  accentColor: string;
}

/**
 * Inline display of the personal-info links (icon + editable label + url). Adding
 * and removing links is handled from the personal-info settings popover (the
 * header's hover-settings element), so this surface only edits existing links.
 */
export function LinksEditor({ accentColor }: LinksEditorProps) {
  const { personalInfo, updateLink } = usePersonalInfo();

  return (
    <Wrap gap="2" align="center">
      {personalInfo.links.map((link) => (
        <HStack key={link.id} gap="1" color={accentColor}>
          <chakra.span fontSize="xs" color={accentColor}>
            <LinkIcon />
          </chakra.span>
          <EditableText
            value={link.label}
            onChange={(value) => updateLink(link.id, { label: value })}
            placeholder={t.personalInfo.linkLabel}
            fontSize="xs"
            color={accentColor}
          />
          <EditableText
            value={link.url}
            onChange={(value) => updateLink(link.id, { url: value })}
            placeholder={t.personalInfo.linkUrl}
            fontSize="xs"
            color="fg.muted"
          />
        </HStack>
      ))}
    </Wrap>
  );
}
