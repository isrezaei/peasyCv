"use client";

import { Box, VStack } from "@chakra-ui/react";
import { A4Page } from "@/components/resume/canvas/A4Page";
import { ColumnBody, type ColumnSectionRun } from "@/components/resume/canvas/ColumnBody";
import { ResumeBackground } from "@/components/resume/canvas/ResumeBackground";
import { TemplateSection } from "@/components/resume/sections/TemplateSection";
import { type ColumnTemplateLayout, useColumnLayout } from "@/hooks/resume/useColumnLayout";
import { getFontStack } from "@/lib/fonts/registry";
import {
  darken,
  ensureReadable,
  isDarkSurface,
  ON_DARK_SURFACE_TEXT,
  resolveTheme,
  resumeTextVars,
  tintColor,
} from "@/lib/themes";
import type { RemovableSectionType, TemplateProps } from "@/types";
import { HeaderBand } from "../_shared/HeaderBand";

/** Reference px → mm (an A4 surface is ~794px wide at 96dpi in both the reference
 *  and this app, so its px map 1:1). Kept local so the geometry reads as the
 *  reference's own numbers. */
const pxToMm = (px: number) => (px * 25.4) / 96;

/** Body-grid gutter — the reference's 26px, shared by the paint and the pagination
 *  width model so the two never diverge. */
const GRID_GAP_MM = pxToMm(26);
/** The card's own vertical padding (18px top + 18px bottom) — the extra page-1
 *  reserve beyond the identity/contacts/photo block the estimator prices. */
const CARD_CHROME_MM = pxToMm(36);
/** Section-icon chip: the reference's 28px square, 8px radius (28 ÷ the 15px page
 *  base so it tracks the font slider like the heading text beside it). */
const CHIP_SIZE = `${(28 / 15).toFixed(3)}em`;
const CHIP_RADIUS = "8px";

/**
 * قالب ۴ — "header-band". The identity/contacts/photo live in a full-width,
 * page-margin-inset rounded CARD across the top (see {@link HeaderBand}); below
 * it a 1.9fr / 1fr grid carries the résumé — About + Experience + Education in the
 * wider (right, in RTL) main column, and Key-achievements + Skills + Projects +
 * Languages + Certificates in the narrower left column. Every heading is the
 * reference's icon-chip. Nothing bleeds: the card and both columns respect the
 * page margins on all sides.
 */
const LAYOUT: ColumnTemplateLayout = {
  // Supporting sections flow in the narrow left column; the rest stay in the main
  // column. Matches the reference's split exactly.
  sideTypes: new Set<RemovableSectionType>([
    "achievements",
    "skills",
    "projects",
    "languages",
    "certifications",
  ]),
  flex: { main: 1.9, side: 1, gapMm: GRID_GAP_MM },
  header: {
    kind: "full",
    estimate: { identity: true, contacts: true, photo: true, photoSizePx: 86 },
    // The card's block padding is the only reserve beyond the estimated block +
    // the section gap the engine already adds; it is fixed px, not margin-scaled.
    chromeMm: () => CARD_CHROME_MM,
  },
};

export function HeaderBandTemplate({ resume, theme }: TemplateProps) {
  const colors = resolveTheme(theme);
  // Page is ALWAYS white (pageBackground is a dead field — see ThemeSettings).
  const backgroundColor = "#FFFFFF";
  const fontStack = getFontStack(theme.fontFamily);
  // The card, the section-icon chips AND the skill pills share ONE light wash of
  // the accent (the reference's #EAEFE0), so every tinted surface recolours together
  // with the résumé palette and harmonises with the header. `tintColor` (not
  // `columnTint`) guarantees the wash stays LIGHT for every theme AND every
  // column-intensity — it never hard-switches to a dark fill — so no theme can put
  // a dark surface behind body content. At intensity 1 it equals the old wash.
  const cardBg = tintColor(colors.marker ?? colors.accent, 0.86, theme.columnIntensity);
  // The wash is always light, so onDark is effectively false; the on-dark tiers are
  // kept only as a defensive fallback and never trigger in practice.
  const onDark = isDarkSurface(cardBg);
  // Name → accent; job title → subtitle; contacts text → a touch deeper than the
  // title (AA on the wash); contact icons → the brighter subtitle tint (the
  // reference's icon glyphs read lighter than the text — a decorative ~3:1 tint).
  const heading = onDark ? ON_DARK_SURFACE_TEXT.heading : ensureReadable(colors.accent, cardBg);
  const titleColor = onDark ? ON_DARK_SURFACE_TEXT.subtitle : ensureReadable(colors.subtitle, cardBg);
  const contactColor = onDark
    ? ON_DARK_SURFACE_TEXT.body
    : ensureReadable(darken(colors.subtitle, 0.15), cardBg);
  const iconColor = onDark ? ON_DARK_SURFACE_TEXT.subtitle : ensureReadable(colors.subtitle, cardBg, 3);
  const placeholder = onDark ? ON_DARK_SURFACE_TEXT.placeholder : "rgba(0,0,0,0.5)";
  // Painted card→grid gap = the engine's reserved section gap, so paint and
  // pagination agree (the reference's 20px is ~one section-spacing step).
  const gridTopGap = `${theme.sectionSpacing}mm`;
  const pages = useColumnLayout(resume, LAYOUT);

  // Both columns render identically — icon-chip headings, accent text, on white.
  const renderSection = ({ section, itemIds, showTitle, itemSlices }: ColumnSectionRun) => (
    <TemplateSection
      section={section}
      resume={resume}
      accent={colors.accent}
      soft={colors.soft}
      variant="chip"
      chipColor={cardBg}
      chipBg={cardBg}
      chipSize={CHIP_SIZE}
      chipRadius={CHIP_RADIUS}
      markerColor={colors.marker}
      skillChipFill={cardBg}
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
          paddingMm={theme.pageMargin}
          backgroundColor={backgroundColor}
          fontStack={fontStack}
          fontScale={theme.fontScale}
          lineHeight={theme.lineHeight}
          decorations={<ResumeBackground theme={theme} colors={colors} idSuffix={`header-band-p${page}`} />}
          contentVars={resumeTextVars(colors.secondary, colors.bodyText, colors.subtitle)}
        >
          <VStack align="stretch" gap="0" minH="inherit">
            {page === 0 ? (
              <HeaderBand
                cardBg={cardBg}
                heading={heading}
                titleColor={titleColor}
                contactColor={contactColor}
                iconColor={iconColor}
                placeholder={placeholder}
                tone={onDark ? "onDark" : "onLight"}
              />
            ) : null}
            <Box
              mt={page === 0 ? gridTopGap : "0"}
              display="grid"
              gridTemplateColumns="1.9fr 1fr"
              gap={`${GRID_GAP_MM}mm`}
              dir="rtl"
            >
              <Box minW="0">
                <ColumnBody blocks={pages.main[page] ?? []} sections={resume.sections} renderSection={renderSection} />
              </Box>
              <Box minW="0">
                <ColumnBody blocks={pages.side[page] ?? []} sections={resume.sections} renderSection={renderSection} />
              </Box>
            </Box>
          </VStack>
        </A4Page>
      ))}
    </VStack>
  );
}
