"use client";

import { Button, chakra, HStack, Wrap } from "@chakra-ui/react";
import { LinkIcon, PlusIcon } from "@/components/ui/icons";
import { usePersonalInfo } from "@/hooks/store/usePersonalInfo";
import { t } from "@/lib/i18n";
import { EditableText } from "./EditableText";

interface LinksEditorProps {
  accentColor: string;
}

export function LinksEditor({ accentColor }: LinksEditorProps) {
  const { personalInfo, addLink, updateLink, removeLink } = usePersonalInfo();

  return (
    <Wrap gap="3" align="center">
      {personalInfo.links.map((link) => (
        <HStack key={link.id} gap="1" className="group/link" color={accentColor}>
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
          <chakra.button
            type="button"
            className="no-print"
            fontSize="xs"
            opacity="0.5"
            _hover={{ opacity: 1 }}
            onClick={() => removeLink(link.id)}
            aria-label={t.personalInfo.removeLink}
          >
            ×
          </chakra.button>
        </HStack>
      ))}
      <Button size="2xs" variant="ghost" colorPalette="accent" className="no-print" onClick={addLink}>
        <PlusIcon />
        {t.personalInfo.addLink}
      </Button>
    </Wrap>
  );
}
