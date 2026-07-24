"use client";

import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { A4Page } from "@/components/resume/canvas/A4Page";
import { ColumnBody, type ColumnSectionRun } from "@/components/resume/canvas/ColumnBody";
import { ResumeBackground } from "@/components/resume/canvas/ResumeBackground";
import { PersonalInfoContacts } from "@/components/resume/editor/PersonalInfoContacts";
import { PersonalInfoIdentity } from "@/components/resume/editor/PersonalInfoIdentity";
import { ProfileImageEditor } from "@/components/resume/editor/ProfileImageEditor";
import { SectionColumnItem } from "@/components/resume/sections/SectionColumnItem";
import { useResumeDocument } from "@/hooks/store/useResumeDocument";
import { type ColumnTemplateLayout, useColumnLayout } from "@/hooks/resume/useColumnLayout";
import { getFontStack } from "@/lib/fonts/registry";
import { t } from "@/lib/i18n";
import { PAGE_MARGIN_MM, resolveSideWidthMm, SIDE_COLUMN_PAD_FACTOR } from "@/lib/pagination";
import {
  columnTint,
  darken,
  ensureReadable,
  isDarkSurface,
  mixWithWhite,
  ON_DARK_SURFACE_TEXT,
  resolveTheme,
  resumeTextVars,
} from "@/lib/themes";
import type { RemovableSectionType, TemplateProps } from "@/types";

/** BASE outer width (mm) of the tinted sidebar — the ONE source the rendered
 *  column and the pagination width model both read. The theme's "Column Layout"
 *  preset offsets it via {@link resolveSideWidthMm}. */
const SIDE_WIDTH_MM = 64;

const LAYOUT: ColumnTemplateLayout = {
  // The tinted sidebar carries the personal-info (photo + contacts, via the split
  // header below) plus the achievements section for now; everything else flows in
  // the main column.
  sideTypes: new Set<RemovableSectionType>(["achievements"]),
  sideWidthMm: SIDE_WIDTH_MM,
  sideWidthAdjustable: true,
  header: {
    kind: "split",
    main: { identity: true },
    side: { photo: true, photoSizePx: 116, contacts: true, contactsPerRow: 1, layout: "stack" },
  },
};

export function SidebarColumnTemplate({ resume, theme }: TemplateProps) {
  const personalInfo = useResumeDocument().personalInfo;
  const colors = resolveTheme(theme);
  // Page is ALWAYS white (pageBackground is a dead field — see ThemeSettings).
  const mainBg = "#FFFFFF";
  const fontStack = getFontStack(theme.fontFamily);
  const gap = `${theme.sectionSpacing}mm`;
  // Vertical margin is the fixed 16mm page margin (equal top/bottom on every page);
  // the horizontal inset follows the slider, tighter still inside the coloured aside.
  const padY = `${PAGE_MARGIN_MM}mm`;
  const padX = `${theme.pageMargin}mm`;
  const sidePadX = `${(theme.pageMargin * SIDE_COLUMN_PAD_FACTOR).toFixed(1)}mm`;
  const nameGap = `${(theme.sectionSpacing * 0.5).toFixed(1)}mm`;
  const sideBoxW = `${resolveSideWidthMm(SIDE_WIDTH_MM, theme.columnWidth)}mm`;
  const sidePadY = padY;
  const pages = useColumnLayout(resume, LAYOUT);

  // In vivid, `marker` equals `base`, so the fill keeps sourcing the palette's
  // secondary exactly as before; classic (marker unset) is byte-identical.
  const sidebarBg = columnTint(colors.marker ?? colors.base, 0.45, theme.columnIntensity);
  // F: keep the accent-family text on a light tint (its proven look), but flip the
  // whole tier — heading, body, chip AND placeholder — to the white family when a
  // saturated palette or a high column-intensity pushes the tint dark, so the
  // sidebar never renders unreadable dark-on-dark text.
  const sidebarOnDark = isDarkSurface(sidebarBg);
  const sidebarHeading = sidebarOnDark
    ? ON_DARK_SURFACE_TEXT.heading
    : ensureReadable(colors.accent, sidebarBg);
  const sidebarText = sidebarOnDark
    ? ON_DARK_SURFACE_TEXT.body
    : ensureReadable(darken(colors.accent, 0.3), sidebarBg);
  const sidebarChip = sidebarOnDark
    ? ON_DARK_SURFACE_TEXT.chip
    : colors.marker ?? mixWithWhite(colors.accent, 0.84);
  const sidebarPlaceholder = sidebarOnDark ? ON_DARK_SURFACE_TEXT.placeholder : undefined;
  // On a dark sidebar the vivid marker override is dropped, so contact/link icons
  // and the section decorations fall back to the adaptive white-family colours
  // instead of keeping a raw hue that may not read on the dark fill.
  const sidebarMarker = sidebarOnDark ? undefined : colors.marker;

  const renderSide = ({ section, itemIds, showTitle, itemSlices }: ColumnSectionRun) => (
    <SectionColumnItem
      section={section}
      resume={resume}
      accent={sidebarText}
      soft={sidebarChip}
      titleColor={sidebarHeading}
      markerColor={sidebarMarker}
      tone={sidebarOnDark ? "onDark" : "onLight"}
      itemIds={itemIds}
      itemSlices={itemSlices}
      showTitle={showTitle}
    />
  );
  const renderMain = ({ section, itemIds, showTitle, itemSlices }: ColumnSectionRun) => (
    <SectionColumnItem
      section={section}
      resume={resume}
      accent={colors.accent}
      soft={colors.soft}
      markerColor={colors.marker}
      itemIds={itemIds}
      itemSlices={itemSlices}
      showTitle={showTitle}
    />
  );

  return (
    <VStack gap="6" align="center" className="resume-pages">
      {Array.from({ length: pages.pageCount }).map((_, page) => (
        <A4Page
          key={page}
          pageIndex={page}
          bleed
          backgroundColor={mainBg}
          fontStack={fontStack}
          fontScale={theme.fontScale}
          lineHeight={theme.lineHeight}
          decorations={<ResumeBackground theme={theme} colors={colors} idSuffix={`sc-p${page}`} />}
          contentVars={resumeTextVars(colors.secondary, colors.bodyText, colors.subtitle)}
        >
          <HStack align="stretch" gap="0" minH="inherit">
            <VStack
              align="stretch"
              width={sideBoxW}
              flexShrink={0}
              bg={sidebarBg}
              color={sidebarText}
              paddingBlock={sidePadY}
              paddingInline={sidePadX}
              gap="0"
              dir="rtl"
              style={resumeTextVars(sidebarHeading, sidebarText, sidebarHeading, sidebarPlaceholder)}
            >
              {page === 0 ? (
                <VStack align="stretch" gap={gap} mb={gap}>
                  {personalInfo.fieldVisibility.photo ? (
                    <Box alignSelf="center">
                      <ProfileImageEditor size="116px" />
                    </Box>
                  ) : null}
                  <PersonalInfoContacts accentColor={sidebarHeading} color={sidebarText} markerColor={sidebarMarker} />
                </VStack>
              ) : null}
              <ColumnBody blocks={pages.side[page] ?? []} sections={resume.sections} renderSection={renderSide} />
              <Box flex="1" />
              {page === pages.pageCount - 1 ? (
                // Editor-only brand footer: `no-print` keeps it out of the PDF.
                <Text
                  className="no-print"
                  fontSize="2xs"
                  color={sidebarHeading}
                  opacity="0.7"
                  textAlign="center"
                  mt={gap}
                >
                  {t.app.title}
                </Text>
              ) : null}
            </VStack>

            <VStack align="stretch" flex="1" minW="0" paddingBlock={padY} paddingInline={padX} gap="0" dir="rtl">
              {page === 0 ? (
                <Box flexShrink={0} mb={nameGap}>
                  <PersonalInfoIdentity accentColor={colors.accent} markerColor={colors.marker} />
                </Box>
              ) : null}
              <ColumnBody blocks={pages.main[page] ?? []} sections={resume.sections} renderSection={renderMain} />
            </VStack>
          </HStack>
        </A4Page>
      ))}
    </VStack>
  );
}
