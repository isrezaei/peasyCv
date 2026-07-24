"use client";

import { chakra, HStack, Wrap } from "@chakra-ui/react";
import { LinkIcon } from "@/components/ui/icons";
import { useAtsMode } from "@/hooks/store/useAtsMode";
import { usePersonalInfo } from "@/hooks/store/usePersonalInfo";
import { t } from "@/lib/i18n";
import { EditableText } from "./EditableText";
import { usePrintText } from "./PrintTextContext";

interface LinksEditorProps {
  accentColor: string;
  /** Decorative colour for the link icon; unset falls back to the accent. The
   *  editable label text always keeps the accent (text is never marker-coloured). */
  markerColor?: string;
  /** Narrow stacked panel: editor inputs end-ellipsize instead of hard-clipping
   *  a long label/URL mid-character (see EditableText.inputEllipsis). */
  inputEllipsis?: boolean;
}

/**
 * Only http(s) destinations become a real hyperlink — anything else (including
 * javascript:/data: schemes) gets no href and prints as plain text, so a stored
 * URL can never smuggle an executable scheme into the exported PDF.
 */
function safeHref(rawUrl: string): string | undefined {
  const url = rawUrl.trim();
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  if (/^[\w-]+(\.[\w-]+)+/.test(url)) return `https://${url}`;
  return undefined;
}

/**
 * Inline display of the personal-info links (icon + editable label + url). Adding
 * and removing links is handled from the personal-info settings popover (the
 * header's hover-settings element), so this surface only edits existing links.
 *
 * The raw URL is an LTR run inside an RTL page, so it always renders with an
 * explicit `dir="ltr"` and truncates from its END — the `https://` start stays
 * visible whatever the available width. On the print surface a labelled link
 * prints ONLY its label, as a hyperlink to the URL; the raw URL text prints only
 * when there is no label.
 */
export function LinksEditor({ accentColor, markerColor, inputEllipsis }: LinksEditorProps) {
  const { personalInfo, updateLink } = usePersonalInfo();
  // ATS Friendly mode drops the link glyph, keeping the label + URL text.
  const ats = useAtsMode();
  const plainText = usePrintText();

  return (
    <Wrap gap="2" align="center">
      {personalInfo.links.map((link) => {
        const hasLabel = link.label.trim().length > 0;
        return (
          <HStack key={link.id} gap="1" color={accentColor} minW="0" maxW="100%">
            {ats ? null : (
              <chakra.span fontSize="xs" color={markerColor ?? accentColor} flexShrink={0}>
                <LinkIcon />
              </chakra.span>
            )}
            {plainText ? (
              <chakra.a
                href={safeHref(link.url)}
                color={hasLabel ? accentColor : "fg.muted"}
                textDecoration="none"
                minW="0"
                maxW="100%"
              >
                <EditableText
                  value={hasLabel ? link.label : link.url}
                  onChange={() => {}}
                  fontSize="xs"
                  color="currentColor"
                  dir={hasLabel ? undefined : "ltr"}
                  truncateEnd={!hasLabel}
                />
              </chakra.a>
            ) : (
              <>
                <EditableText
                  value={link.label}
                  onChange={(value) => updateLink(link.id, { label: value })}
                  placeholder={t.personalInfo.linkLabelPlaceholder}
                  fontSize="xs"
                  color={accentColor}
                  autoWidth
                  inputEllipsis={inputEllipsis}
                />
                <EditableText
                  value={link.url}
                  onChange={(value) => updateLink(link.id, { url: value })}
                  placeholder={t.personalInfo.linkUrlPlaceholder}
                  fontSize="xs"
                  color="fg.muted"
                  dir="ltr"
                  autoWidth
                  truncateEnd
                />
              </>
            )}
          </HStack>
        );
      })}
    </Wrap>
  );
}
