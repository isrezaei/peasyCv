"use client";

import { Box, HStack, VStack } from "@chakra-ui/react";
import { A4Page } from "@/components/resume/canvas/A4Page";
import { ColumnBody, type ColumnSectionRun } from "@/components/resume/canvas/ColumnBody";
import { ResumeBackground } from "@/components/resume/canvas/ResumeBackground";
import { PersonalInfoContacts } from "@/components/resume/editor/PersonalInfoContacts";
import { ProfileImageEditor } from "@/components/resume/editor/ProfileImageEditor";
import { TemplateSection } from "@/components/resume/sections/TemplateSection";
import { useResumeDocument } from "@/hooks/store/useResumeDocument";
import { type ColumnTemplateLayout, useColumnLayout } from "@/hooks/resume/useColumnLayout";
import { getFontStack } from "@/lib/fonts/registry";
import { PAGE_MARGIN_MM, SIDE_COLUMN_PAD_FACTOR } from "@/lib/pagination";
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
import { PlainHeader } from "../_shared/PlainHeader";

/** Supporting sections that sit in the tinted photo aside (قالب ۲). */
const LAYOUT: ColumnTemplateLayout = {
  sideTypes: new Set<RemovableSectionType>(["projects", "languages", "certifications"]),
  sideWidthMm: 68,
  header: {
    kind: "split",
    main: { identity: true, extraPx: 18 },
    side: { photo: true, photoSizePx: 140, contacts: true, contactsPerRow: 1, layout: "stack" },
  },
};

export function AsidePhotoTemplate({ resume, theme }: TemplateProps) {
  const personalInfo = useResumeDocument().personalInfo;
  const colors = resolveTheme(theme);
  // Page is ALWAYS white (pageBackground is a dead field — see ThemeSettings).
  const mainBg = "#FFFFFF";
  const fontStack = getFontStack(theme.fontFamily);
  const gap = `${theme.sectionSpacing}mm`;
  // Fixed 16mm vertical margin (equal top/bottom); horizontal follows the slider,
  // tighter inside the photo aside.
  const padY = `${PAGE_MARGIN_MM}mm`;
  const padX = `${theme.pageMargin}mm`;
  const sidePadX = `${(theme.pageMargin * SIDE_COLUMN_PAD_FACTOR).toFixed(1)}mm`;
  const pages = useColumnLayout(resume, LAYOUT);

  const asideBg = columnTint(colors.base, 0.5, theme.columnIntensity);
  // F: same adaptive tier switch as the other tinted columns — keep the accent
  // family on a light tint (deepened via ensureReadable only when a cross-hue
  // palette or a high column-intensity drops it below AA; passing palettes stay
  // byte-identical), and flip the whole tier — heading, body, chip, icon marker
  // AND placeholder — to the white family when the tint lands dark.
  const asideOnDark = isDarkSurface(asideBg);
  const asideHeading = asideOnDark
    ? ON_DARK_SURFACE_TEXT.heading
    : ensureReadable(colors.accent, asideBg);
  const asideText = asideOnDark
    ? ON_DARK_SURFACE_TEXT.body
    : ensureReadable(darken(colors.accent, 0.3), asideBg);
  const asideChip = asideOnDark ? ON_DARK_SURFACE_TEXT.chip : mixWithWhite(colors.accent, 0.84);
  const asidePlaceholder = asideOnDark ? ON_DARK_SURFACE_TEXT.placeholder : undefined;
  // On a dark aside the vivid marker override is dropped, so contact/link icons and
  // the section decorations fall back to the adaptive (white-family) text colours.
  const asideMarker = asideOnDark ? undefined : colors.marker;
  const mainChip = mixWithWhite(colors.accent, 0.86);

  const renderSide = ({ section, itemIds, showTitle, itemSlices }: ColumnSectionRun) => (
    <TemplateSection
      section={section}
      resume={resume}
      accent={asideText}
      soft={asideChip}
      titleColor={asideHeading}
      variant="chip"
      chipColor={asideChip}
      tone={asideOnDark ? "onDark" : "onLight"}
      markerColor={asideMarker}
      compact
      itemIds={itemIds}
      itemSlices={itemSlices}
      showTitle={showTitle}
    />
  );
  const renderMain = ({ section, itemIds, showTitle, itemSlices }: ColumnSectionRun) => (
    <TemplateSection
      section={section}
      resume={resume}
      accent={colors.accent}
      soft={colors.soft}
      variant="chip"
      chipColor={mainChip}
      markerColor={colors.marker}
      compact
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
          decorations={<ResumeBackground theme={theme} colors={colors} idSuffix={`aside-photo-p${page}`} />}
          contentVars={resumeTextVars(colors.secondary, colors.bodyText, colors.subtitle)}
        >
          <HStack align="stretch" gap="0" minH="inherit">
            <VStack
              align="stretch"
              width="68mm"
              flexShrink={0}
              bg={asideBg}
              color={asideText}
              paddingBlock={padY}
              paddingInline={sidePadX}
              gap="0"
              dir="rtl"
              style={resumeTextVars(asideHeading, asideText, asideHeading, asidePlaceholder)}
            >
              {page === 0 ? (
                <VStack align="stretch" gap={gap} mb={gap}>
                  {personalInfo.fieldVisibility.photo ? (
                    <Box alignSelf="center">
                      <ProfileImageEditor size="140px" />
                    </Box>
                  ) : null}
                  <PersonalInfoContacts accentColor={asideHeading} color={asideText} markerColor={asideMarker} />
                </VStack>
              ) : null}
              <ColumnBody blocks={pages.side[page] ?? []} sections={resume.sections} renderSection={renderSide} />
            </VStack>

            <VStack align="stretch" flex="1" minW="0" paddingBlock={padY} paddingInline={padX} gap="0" dir="rtl">
              {page === 0 ? (
                <Box mb={gap}>
                  <PlainHeader accentColor={colors.accent} showPhoto={false} showContacts={false} divider markerColor={colors.marker} />
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
