"use client";

import { useMemo } from "react";
import { Box, VStack } from "@chakra-ui/react";
import { A4Page } from "@/components/resume/canvas/A4Page";
import { ColumnBody, type ColumnSectionRun } from "@/components/resume/canvas/ColumnBody";
import { BackgroundLayer } from "@/components/resume/backgrounds/BackgroundLayer";
import { SECTION_HOVER_FRAME_REVEAL } from "@/components/resume/editor/HoverFrame";
import { PersonalInfoIdentity } from "@/components/resume/editor/PersonalInfoIdentity";
import { PersonalInfoSettings } from "@/components/resume/editor/PersonalInfoSettings";
import { ProfileImageEditor } from "@/components/resume/editor/ProfileImageEditor";
import { EntryRailHiddenProvider } from "@/components/resume/editor/TimelineRail";
import { TemplateSection } from "@/components/resume/sections/TemplateSection";
import { type ColumnTemplateLayout, useColumnLayout } from "@/hooks/resume/useColumnLayout";
import { getFontStack } from "@/lib/fonts/registry";
import {
  A4_HEIGHT_MM,
  A4_WIDTH_MM,
  resolveSideWidthMm,
  SECTION_TITLE_CONTENT_GAP_PX,
  SECTION_TITLE_PAD_EM,
  SECTION_TITLE_TEXT_LINE_HEIGHT,
} from "@/lib/pagination";
import {
  contrastRatio,
  darken,
  ensureReadable,
  isDarkSurface,
  mixWithWhite,
  ON_DARK_SURFACE_TEXT,
  relativeLuminance,
  resolveTheme,
  resumeTextVars,
  tintColor,
} from "@/lib/themes";
import type { PersonalInfo, RemovableSectionType, TemplateProps, ThemeSettings } from "@/types";
import { PanelContactsTrack } from "./PanelContactsTrack";
import { TimelineTrack } from "./TimelineTrack";
import {
  ABOUT_LINE_HEIGHT,
  ACHIEVEMENT_LINE_HEIGHT,
  BODY_LINE_HEIGHT,
  CONTACT_PX,
  CONTACT_ROW_GAP_PX,
  GUTTER_MM,
  JOB_TITLE_FS,
  JOB_TITLE_PX,
  JOB_TITLE_TRACKING,
  JOB_TITLE_WEIGHT,
  MAIN_RAIL,
  MAIN_RAIL_DARKEN,
  MAIN_RAIL_MIN_CONTRAST,
  MAIN_TITLE_ESTIMATE_EM,
  MAIN_TITLE_FS,

  MAIN_TITLE_TRACKING,
  MAIN_TITLE_WEIGHT,
  MAIN_TOP_PX,
  NAME_FS,
  NAME_LINE_HEIGHT,
  NAME_PX,
  NAME_TO_TITLE_PX,
  PAGE_VPAD_MM,
  PANEL_CHROMA_SOFTEN,
  PANEL_FRACTION,
  PANEL_MIN_LUMINANCE,
  PANEL_PAD_BOTTOM_PX,
  PANEL_PAD_END_PX,
  PANEL_PAD_INLINE_PX,
  PANEL_PAD_START_PX,
  PANEL_PAD_TOP_BARE_PX,
  PANEL_PAD_TOP_PX,
  PANEL_PATTERN_OPACITY,
  PANEL_RADIUS,
  PANEL_RAIL,
  PANEL_SECTION_TRAILING_PX,
  PANEL_TINT_WHITE_MIX,
  PANEL_TITLE_ESTIMATE_EM,
  PANEL_TITLE_FS,
  PANEL_TITLE_PX,
  PANEL_TITLE_TRACKING,
  PANEL_TITLE_WEIGHT,
  panelScaleFor,
  PHOTO_OVERLAP_PX,
  PHOTO_PX,
  pxToMm,
  railInsetPx,
  softenChroma,
} from "./tokens";

/**
 * قالب ۳ — "timeline-panel", a reference-faithful implementation of the imported
 * design (`Resume.dc.html`).
 *
 * COMPOSITION. A tinted, rounded PANEL card runs the full height of the page on
 * the inline-end side (visually LEFT, exactly where the reference places it —
 * its own container is `direction: ltr` so the panel sits left of the RTL body),
 * carrying the photo, the contacts and the supporting sections. The main column
 * carries the identity and every narrative section. Both regions draw the SAME
 * device: a rail gutter with one marker per SECTION, the line chaining each
 * marker to the next (see {@link TimelineTrack}) — never one rail per entry, so
 * the shared entry rail is suppressed for this template's subtree.
 *
 * COLOUR. Nothing is hardcoded from the reference. The panel wash, the rails, the
 * markers, the headings and every text tier resolve through the app's existing
 * theme roles, so switching palette recolours this template like every other one.
 * The wash is held to a lightness FLOOR, so no palette and no column-intensity
 * can turn the A4 surface into a dark fill — a résumé is a printed document.
 */
const SIDE_TYPES = new Set<RemovableSectionType>(["education", "languages", "skills"]);

/** Reference `#dacbba` band: the theme's mid-tone, never allowed to read dark
 *  and pulled into the reference's own CALM low-chroma band — a tinted panel,
 *  not a saturated block. */
function panelWash(source: string, intensity: number): string {
  let wash = softenChroma(tintColor(source, PANEL_TINT_WHITE_MIX, intensity), PANEL_CHROMA_SOFTEN);
  // Lift a saturated palette toward white until it clears the floor. Bounded
  // loop; `mixWithWhite` converges monotonically on #FFFFFF.
  for (let step = 0; step < 12 && relativeLuminance(wash) < PANEL_MIN_LUMINANCE; step += 1) {
    wash = mixWithWhite(wash, 0.12);
  }
  return wash;
}

/** Reference `#C4B098`: the panel wash, one step deeper, kept visible on white. */
function mainRailColour(wash: string, pageBg: string): string {
  let rail = darken(wash, MAIN_RAIL_DARKEN);
  for (let step = 0; step < 12 && contrastRatio(rail, pageBg) < MAIN_RAIL_MIN_CONTRAST; step += 1) {
    rail = darken(rail, 0.08);
  }
  return rail;
}

/** How many contact ROWS the stacked panel list paints for this résumé. */
function contactRowCount(info: PersonalInfo): number {
  const { fieldVisibility: v } = info;
  const fields = [v.phone, v.email, v.location, v.dateOfBirth, v.nationality, v.militaryService];
  return fields.filter(Boolean).length + (v.links ? info.links.length : 0);
}

/**
 * The page-1 header reserves, in px, computed from the SAME numbers the page
 * paints with — the design's type is pinned to the reference's px (as em of the
 * page base), so the shared `identityMm`/`contactsMm` models, which assume the
 * app's default scale, would price a different block than this template draws.
 * Everything here is therefore priced explicitly and exactly.
 */
function headerReservePx(
  info: PersonalInfo,
  theme: ThemeSettings,
  /** The panel's own text scale (see {@link panelScaleFor}) — every side text
   *  term AND the photo scale with it, exactly as the card paints them. */
  panelScale: number,
): { main: number; side: number } {
  const base = 15 * (theme.fontScale > 0 ? theme.fontScale : 1);
  const lh = theme.lineHeight > 0 ? theme.lineHeight : 1.5;

  // Main: the column's own top offset + the tight-boxed name + the job title.
  const main =
    MAIN_TOP_PX +
    base * (NAME_PX / 15) * NAME_LINE_HEIGHT +
    (info.fieldVisibility.jobTitle ? NAME_TO_TITLE_PX + base * (JOB_TITLE_PX / 15) * lh : 0);

  // Side: the photo's exposed part above the card, the card's top padding, and
  // the titled contacts track (SectionFrame's own title-row model + the rows).
  // Text terms carry the panel scale (the card's own font-size); the photo and
  // its overlap carry it too (they render scaled); fixed px chrome does not.
  const rows = contactRowCount(info);
  const withPhoto = info.fieldVisibility.photo;
  const photoPx = Math.round(PHOTO_PX * panelScale);
  const overlapPx = Math.round(PHOTO_OVERLAP_PX * panelScale);
  const titleRow =
    base *
      panelScale *
      (2 * SECTION_TITLE_PAD_EM + (PANEL_TITLE_PX / 15) * SECTION_TITLE_TEXT_LINE_HEIGHT) +
    SECTION_TITLE_CONTENT_GAP_PX;
  const contacts =
    rows > 0
      ? rows * base * panelScale * (CONTACT_PX / 15) * lh +
        (rows - 1) * CONTACT_ROW_GAP_PX +
        // The contacts block's own trailing pad, which evens its gap to the
        // first panel section (see PANEL_SECTION_TRAILING_PX).
        PANEL_SECTION_TRAILING_PX
      : 0;
  const side =
    (withPhoto ? photoPx - overlapPx : 0) +
    // With the photo, the card's top pad is the (scaled) overlap plus the
    // reference's 18px clearance under it; bare, it mirrors the bottom pad.
    (withPhoto ? PANEL_PAD_TOP_PX - PHOTO_OVERLAP_PX + overlapPx : PANEL_PAD_TOP_BARE_PX) +
    // The card's bottom padding is page-1 chrome the side flow must clear too.
    PANEL_PAD_BOTTOM_PX +
    (rows > 0 ? titleRow + contacts : 0);

  return { main, side };
}

export function TimelinePanelTemplate({ resume, theme }: TemplateProps) {
  const colors = resolveTheme(theme);
  // The page is ALWAYS white (pageBackground is a dead field — see ThemeSettings).
  const pageBg = "#FFFFFF";
  const fontStack = getFontStack(theme.fontFamily);

  // ── Geometry ──────────────────────────────────────────────────────────────
  // The reference's 30% / 24px-gutter split, taken of THIS page's content box so
  // the relationship holds at every page-margin setting; the theme's "Column
  // Layout" preset offsets the panel exactly as it does for the other adjustable
  // column template.
  const contentMm = A4_WIDTH_MM - 2 * theme.pageMargin;
  const sideMm = Math.max(
    30,
    Math.min(resolveSideWidthMm(contentMm * PANEL_FRACTION, theme.columnWidth), contentMm - GUTTER_MM - 40),
  );
  const mainMm = contentMm - GUTTER_MM - sideMm;
  // Full page height minus the reference's own 24px vertical padding — the box
  // the panel card stretches through, exactly as the reference's `height: 100%`.
  const bodyHeightMm = A4_HEIGHT_MM - 2 * PAGE_VPAD_MM;
  // The panel's text scale follows the panel's own width (see panelScaleFor).
  const panelScale = panelScaleFor(sideMm);

  const reserve = headerReservePx(resume.personalInfo, theme, panelScale);
  const layout = useMemo<ColumnTemplateLayout>(
    () => ({
      sideTypes: SIDE_TYPES,
      flex: { main: mainMm, side: sideMm, gapMm: GUTTER_MM },
      // This template owns its vertical page margin — the reference's 24px frame
      // — painted below as the SAME `paddingBlock` on the bleed page.
      verticalMarginMm: PAGE_VPAD_MM,
      // Chrome painted INSIDE each column that carries no text: the rail gutter
      // in both, plus the panel card's inline padding.
      contentInsetMm: {
        main: pxToMm(railInsetPx(MAIN_RAIL)),
        side: pxToMm(railInsetPx(PANEL_RAIL) + PANEL_PAD_INLINE_PX),
      },
      // The design's headings are far from the shared scale, so the reserve is
      // told the em each column actually paints (see LayoutMetrics.sectionTitleEm).
      sectionTitleEm: { main: MAIN_TITLE_ESTIMATE_EM, side: PANEL_TITLE_ESTIMATE_EM },
      // The reference stacks EVERY dated entry: the main column's «title /
      // date | company / bullets» composition and the panel's period-above-
      // degree one. The panel is far too narrow for the shared 25mm date column
      // anyway (it would leave ~10mm of text).
      stackedEntries: { main: true, side: true },
      // The reference's remaining main-column compositions: the 2-up projects
      // sub-grid and the one-row «name … issuer · date» certifications.
      projectsGrid: { main: true },
      certInlineMeta: { main: true },
      // The panel's bare (marker-less) skill lines.
      plainSkillList: { side: true },
      // The reference's 12px «دربارهٔ من» prose.
      summaryEm: { main: 12 / 15 },
      // The reference's per-tier prose line-heights (see tokens.ts).
      proseLineHeights: {
        main: {
          summary: ABOUT_LINE_HEIGHT,
          body: BODY_LINE_HEIGHT,
          achievement: ACHIEVEMENT_LINE_HEIGHT,
        },
      },
      // The reference's «دستاوردهای کلیدی» is a plain bullet list, not cards.
      achievementBullets: { main: true },
      // The panel card paints all its text at its own width-driven scale.
      fontScaleMul: { side: panelScale },
      header: {
        kind: "split",
        // Every piece is priced explicitly in `extraPx` (see headerReservePx).
        main: { extraPx: Math.round(reserve.main) },
        side: { extraPx: Math.round(reserve.side) },
      },
    }),
    [mainMm, sideMm, panelScale, reserve.main, reserve.side],
  );
  const pages = useColumnLayout(resume, layout);

  // ── Colour roles ──────────────────────────────────────────────────────────
  const panelBg = panelWash(colors.base, theme.columnIntensity);
  // The wash is floored light, so this is never true in practice; the on-dark
  // tiers stay as a defensive fallback only.
  const panelOnDark = isDarkSurface(panelBg);
  const panelHeading = panelOnDark ? ON_DARK_SURFACE_TEXT.heading : ensureReadable(colors.accent, panelBg);
  const panelSecondary = panelOnDark
    ? ON_DARK_SURFACE_TEXT.heading
    : ensureReadable(colors.secondary, panelBg);
  const panelBody = panelOnDark ? ON_DARK_SURFACE_TEXT.body : ensureReadable(colors.bodyText, panelBg);
  const panelSubtitle = panelOnDark
    ? ON_DARK_SURFACE_TEXT.subtitle
    : ensureReadable(colors.subtitle, panelBg);
  const panelChip = panelOnDark ? ON_DARK_SURFACE_TEXT.chip : mixWithWhite(colors.accent, 0.84);
  const panelPlaceholder = panelOnDark ? ON_DARK_SURFACE_TEXT.placeholder : "rgba(0,0,0,0.45)";
  // Reference: the panel's rail AND marker ring are the panel heading's own ink
  // (`#4a443c` ≈ its `#2f2b26` h2); its marker is filled with the panel itself.
  const panelRailColour = panelOnDark ? ON_DARK_SURFACE_TEXT.heading : panelHeading;
  // Reference: the MAIN rail is the light panel-family tan (`#C4B098`) while its
  // marker ring is the ink tier (`#333333`) on a white fill — the app's BODY
  // text role, the near-neutral ink of the family (never the bright accent).
  const mainRailColour_ = mainRailColour(panelBg, pageBg);
  const mainDotColour = colors.marker ?? colors.bodyText;

  // ── Section renderers ─────────────────────────────────────────────────────
  const renderMain = (run: ColumnSectionRun) => (
    <TimelineTrack
      rail={MAIN_RAIL}
      lineColor={mainRailColour_}
      dotColor={mainDotColour}
      dotFill={pageBg}
      titled={run.showTitle}
      // The reference's final MAIN section carries no rail element at all — the
      // timeline stops at the last marker rather than dangling into empty space.
      tail={run.index === run.count - 1 ? "none" : "chain"}
      gapBelowMm={run.gapBelowMm}
    >
      <TemplateSection
        section={run.section}
        resume={resume}
        accent={colors.accent}
        soft={colors.soft}
        variant="plain"
        markerColor={colors.marker}
        titleFontSize={MAIN_TITLE_FS}
        titleFontWeight={MAIN_TITLE_WEIGHT}
        titleLetterSpacing={MAIN_TITLE_TRACKING}
        compact
        // The reference's main-column compositions (must mirror the layout
        // descriptor's flags exactly — paint and reserve are one contract).
        stackedEntries
        projectsGrid
        certInlineMeta
        summaryFontSize="0.8em"
        proseLineHeights={{
          summary: String(ABOUT_LINE_HEIGHT),
          body: String(BODY_LINE_HEIGHT),
          achievement: String(ACHIEVEMENT_LINE_HEIGHT),
        }}
        achievementBullets
        itemIds={run.itemIds}
        itemSlices={run.itemSlices}
        showTitle={run.showTitle}
      />
    </TimelineTrack>
  );

  const renderSide = (run: ColumnSectionRun) => (
    <TimelineTrack
      rail={PANEL_RAIL}
      lineColor={panelRailColour}
      dotColor={panelRailColour}
      dotFill={panelBg}
      titled={run.showTitle}
      // The reference's final PANEL section («مهارت‌ها») DOES keep a rail, spanning
      // its own content and stopping there — the panel's line runs the list out.
      tail={run.index === run.count - 1 ? "content" : "chain"}
      gapBelowMm={run.gapBelowMm}
    >
      <TemplateSection
        section={run.section}
        resume={resume}
        accent={panelHeading}
        soft={panelChip}
        titleColor={panelHeading}
        variant="plain"
        tone={panelOnDark ? "onDark" : "onLight"}
        markerColor={panelOnDark ? undefined : colors.marker}
        stackedEntries
        skillsPlainList
        titleFontSize={PANEL_TITLE_FS}
        titleFontWeight={PANEL_TITLE_WEIGHT}
        titleLetterSpacing={PANEL_TITLE_TRACKING}
        compact
        itemIds={run.itemIds}
        itemSlices={run.itemSlices}
        showTitle={run.showTitle}
      />
    </TimelineTrack>
  );

  const gapMm = theme.sectionSpacing;
  const showPhoto = resume.personalInfo.fieldVisibility.photo;
  const contactRows = contactRowCount(resume.personalInfo);

  return (
    // One rail per SECTION is this design's device, so the shared per-ENTRY rail
    // is switched off for the whole subtree instead of forking the entry blocks.
    <EntryRailHiddenProvider value={true}>
      <VStack gap="6" align="center" className="resume-pages">
        {Array.from({ length: pages.pageCount }).map((_, page) => {
          const sideBlocks = pages.side[page] ?? [];
          const leading = page === 0 && (showPhoto || contactRows > 0);
          // No panel content and no leading block → no stranded coloured column:
          // the page falls back to the reference's own continuation layout, a
          // single full-width timeline column (its «صفحه ۲»).
          const withPanel = leading || sideBlocks.length > 0;

          return (
            <A4Page
              key={page}
              pageIndex={page}
              // The frame's locked 16mm vertical margin is escaped via `bleed`:
              // this template owns the reference's 24px page padding, painted
              // below as the SAME `paddingBlock` the layout's verticalMarginMm
              // breaks against. No page-level decorations — the background
              // pattern lives INSIDE the panel card only (see below).
              bleed
              backgroundColor={pageBg}
              fontStack={fontStack}
              fontScale={theme.fontScale}
              lineHeight={theme.lineHeight}
              contentVars={resumeTextVars(colors.secondary, colors.bodyText, colors.subtitle)}
            >
              <Box
                display="grid"
                gridTemplateColumns={withPanel ? `${mainMm}mm ${sideMm}mm` : "1fr"}
                gridTemplateRows="1fr"
                columnGap={`${GUTTER_MM}mm`}
                alignItems="stretch"
                minHeight={`${A4_HEIGHT_MM}mm`}
                paddingBlock={`${PAGE_VPAD_MM}mm`}
                paddingInline={`${theme.pageMargin}mm`}
                dir="rtl"
              >
                {/* MAIN — identity + narrative sections. */}
                <Box minWidth="0" paddingTop={page === 0 ? `${MAIN_TOP_PX}px` : "0"}>
                  {page === 0 ? (
                    <Box className="group" css={SECTION_HOVER_FRAME_REVEAL} mb={`${gapMm}mm`}>
                      <PersonalInfoIdentity
                        accentColor={colors.accent}
                        nameColor={colors.accent}
                        subtitleColor={colors.subtitle}
                        markerColor={colors.marker}
                        nameFontSize={NAME_FS}
                        nameFontWeight="900"
                        nameLineHeight={String(NAME_LINE_HEIGHT)}
                        // The reference's display name carries NO tracking, unlike
                        // the shared header's tight negative default.
                        nameLetterSpacing="normal"
                        subtitleFontSize={JOB_TITLE_FS}
                        subtitleFontWeight={JOB_TITLE_WEIGHT}
                        subtitleLetterSpacing={JOB_TITLE_TRACKING}
                        gap={`${NAME_TO_TITLE_PX}px`}
                        rightSlot={<PersonalInfoSettings triggerSize="2xs" />}
                      />
                    </Box>
                  ) : null}
                  <ColumnBody
                    blocks={pages.main[page] ?? []}
                    sections={resume.sections}
                    renderSection={renderMain}
                  />
                </Box>

                {/* PANEL — photo overlapping a full-height tinted card. */}
                {withPanel ? (
                  <Box minWidth="0" display="flex" flexDirection="column">
                    {leading && showPhoto ? (
                      <Box
                        alignSelf="center"
                        position="relative"
                        zIndex={2}
                        // Reference: the photo overlaps the card's top edge. It
                        // scales with the panel, like the card's text.
                        marginBottom={`-${Math.round(PHOTO_OVERLAP_PX * panelScale)}px`}
                        flexShrink={0}
                      >
                        <ProfileImageEditor size={`${Math.round(PHOTO_PX * panelScale)}px`} />
                      </Box>
                    ) : null}
                    <Box
                      flex="1"
                      minWidth="0"
                      position="relative"
                      bg={panelBg}
                      color={panelBody}
                      borderRadius={PANEL_RADIUS}
                      // ONE relative factor scales every pinned em inside the
                      // card with the panel's own width (see panelScaleFor);
                      // structural px chrome (rail, radius, paddings) stays put.
                      fontSize={`${panelScale}em`}
                      paddingTop={
                        leading && showPhoto
                          ? `${PANEL_PAD_TOP_PX - PHOTO_OVERLAP_PX + Math.round(PHOTO_OVERLAP_PX * panelScale)}px`
                          : `${PANEL_PAD_TOP_BARE_PX}px`
                      }
                      paddingBottom={`${PANEL_PAD_BOTTOM_PX}px`}
                      paddingInlineStart={`${PANEL_PAD_START_PX}px`}
                      paddingInlineEnd={`${PANEL_PAD_END_PX}px`}
                      dir="rtl"
                      style={resumeTextVars(panelSecondary, panelBody, panelSubtitle, panelPlaceholder)}
                      // Print backgrounds: keep the panel fill in the exported PDF.
                      css={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
                    >
                      {/* Decorative pattern: INSIDE the card only — sized by the
                          card, clipped to its radius, and held far below the
                          full-page strength so it stays a texture under the
                          panel's text. Never rendered anywhere else on the page. */}
                      {theme.backgroundPattern !== "none" ? (
                        <Box
                          aria-hidden="true"
                          position="absolute"
                          inset="0"
                          overflow="hidden"
                          borderRadius={PANEL_RADIUS}
                          pointerEvents="none"
                          zIndex={0}
                          css={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
                        >
                          <BackgroundLayer
                            pattern={theme.backgroundPattern}
                            accent={colors.accent}
                            base={colors.base}
                            soft={colors.soft}
                            idSuffix={`timeline-panel-p${page}`}
                            // The column variant fills the strip with many small
                            // elements (its own tall-narrow user space) instead
                            // of one sliced A4 corner.
                            column
                            preserveAspectRatio="xMidYMid slice"
                            intensity={theme.backgroundIntensity * PANEL_PATTERN_OPACITY}
                          />
                        </Box>
                      ) : null}
                      <Box position="relative" zIndex={1}>
                        {leading && contactRows > 0 ? (
                          <Box mb={sideBlocks.length > 0 ? `${gapMm}mm` : "0"}>
                            <PanelContactsTrack
                              headingColor={panelHeading}
                              textColor={panelBody}
                              iconColor={panelRailColour}
                              lineColor={panelRailColour}
                              dotColor={panelRailColour}
                              dotFill={panelBg}
                              tail={sideBlocks.length > 0 ? "chain" : "content"}
                              gapBelowMm={gapMm}
                            />
                          </Box>
                        ) : null}
                        <ColumnBody
                          blocks={sideBlocks}
                          sections={resume.sections}
                          renderSection={renderSide}
                        />
                      </Box>
                    </Box>
                  </Box>
                ) : null}
              </Box>
            </A4Page>
          );
        })}
      </VStack>
    </EntryRailHiddenProvider>
  );
}
