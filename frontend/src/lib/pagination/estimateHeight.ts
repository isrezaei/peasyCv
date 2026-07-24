import type {
  AchievementItem,
  EducationItem,
  ExperienceItem,
  PersonalInfo,
  ProjectItem,
  SectionMeta,
  SkillGroup,
} from "@/types";
import { shouldRenderProjectLink } from "@/lib/resume/projectLink";
import {
  ACHIEVEMENT_BULLET_EM,
  ACHIEVEMENT_BULLET_MARKER_COL_PX,
  ACHIEVEMENT_CELL_PAD_PX,
  ACHIEVEMENT_GRID_GAP_MM,
  ACHIEVEMENT_ICON_BOX_PX,
  ACHIEVEMENT_ICON_COL_PX,
  BULLET_MARKER_COL_PX,
  CERT_INLINE_NAME_EM,
  CHAR_MM_PER_FONT_PX,
  EDU_REMOVE_COL_PX,
  EM_BODY,
  EM_ITEM_TITLE,
  EM_NAME,
  EM_SECTION_TITLE,
  EM_SUBTITLE,
  EM_SUMMARY,
  EXP_MAIN_END_PAD_PX,
  LANGUAGE_BAR_HEIGHT_COMPACT_PX,
  LANGUAGE_BAR_HEIGHT_PX,
  LANGUAGE_LINE_GAP_PX,
  LANGUAGE_LINE_TRACK_PX,
  LANGUAGE_METER_BOX_COMPACT_PX,
  LANGUAGE_METER_BOX_PX,
  MULTILINE_ROWS,
  LIST_BULLET_LINE_PX,
  PROJECT_CELL_DESC_EM,
  PROJECT_CELL_LINK_EM,
  PROJECT_CELL_TITLE_EM,
  PROJECT_GRID_COL_GAP_MM,
  SECTION_ICON_BOX_EM,
  SECTION_TITLE_CONTENT_GAP_PX,
  SECTION_TITLE_PAD_EM,
  SECTION_TITLE_TEXT_LINE_HEIGHT,
  STACKED_BULLET_EM,
  STACKED_BULLET_GAP_PX,
  STACKED_BULLET_MARKER_COL_PX,
  STACKED_EDU_META_EM,
  STACKED_EDU_SUBTITLE_EM,
  STACKED_EDU_TITLE_EM,
  STACKED_ENTRY_META_EM,
  STACKED_ENTRY_TITLE_EM,
  STACKED_LIST_TOP_PX,
  TIMELINE_CHROME_PX,
  periodDateColumnMm,
  PX_PER_MM,
} from "./constants";
import { estimateHtmlLines } from "./estimateHtmlLines";
import { type LayoutMetrics, pxToMm } from "./metrics";

/**
 * Height estimators for every resume block, mirroring how the editor paints them
 * on screen. Constants were calibrated against the live DOM with
 * scripts/measure-pagination.mjs and biased slightly high, so a block is never
 * under-counted and the packer breaks a touch early rather than letting content
 * spill past the A4 frame. Text contributions flow through `metrics.lineMm`, so
 * they scale with the font-size and line-height sliders; structural chrome is
 * fixed px converted with `pxToMm`.
 */

const PROFILE_PHOTO_PX = 128; // ProfileImageEditor default size
/**
 * The section heading block measures ~2.1 rendered line-heights in the flow. The
 * heading now paints with a tight 1.15 line-box (not the airy body line-height) and
 * sits just 0.5 spacing-units above its content, so it renders shorter than before;
 * this factor is trimmed from 2.4 to match, keeping the estimate a touch above the
 * true height (never under) so the packer still fills to the 16mm bottom then breaks.
 */
const SECTION_TITLE_LINE_FACTOR = 2.1;

/**
 * A multiline field is a grow-to-content rich-text editor, so it reserves exactly
 * the wrapped-line count down to a one-line floor (`MULTILINE_ROWS`). Wrapped lines
 * are counted with the same `estimateHtmlLines` helper the summary uses — it strips
 * inline marks and treats block/`<br>` boundaries as line breaks — using
 * `bodyCharsPerLine`, which the column metrics scale to the real column width so a
 * narrow entry column counts the extra wraps.
 */
function multilineMm(
  m: LayoutMetrics,
  em: number,
  html: string,
  charsPerLine: number = m.bodyCharsPerLine,
  /** Explicit line-height when the template pins one (see proseLineHeights). */
  lineHeight?: number,
): number {
  const lines = Math.max(MULTILINE_ROWS, estimateHtmlLines(html, charsPerLine));
  return lines * (lineHeight != null ? m.lineMmAt(em, lineHeight) : m.lineMm(em));
}

/** One line of a prose tier: the pinned line-height when the template sets one,
 *  otherwise the theme's slider (identical to `lineMm` for every other template). */
function proseLineMm(m: LayoutMetrics, em: number, lineHeight?: number): number {
  return lineHeight != null ? m.lineMmAt(em, lineHeight) : m.lineMm(em);
}

/**
 * Real rendered width (mm) of an entry's MAIN column: the flow width minus the
 * section-conditional date column and the fixed timeline rail/gap chrome —
 * verified against the live DOM (142.15mm in the 178mm flow, 78.16mm in the
 * 114mm sidebar-column main flow). Wrap capacities MUST derive from this real
 * width (via `m.wrapCharsPerLine`), never from flow-proportional scaling: the
 * fixed chrome eats a far larger share of a narrow column, so proportional
 * scaling over-credited a narrow main column's capacity and under-reserved
 * every entry there (the M1/M2 overflow family).
 */
function entryMainColumnMm(m: LayoutMetrics, dateColumnMm: number): number {
  return Math.max(20, m.contentWidthMm - dateColumnMm - pxToMm(TIMELINE_CHROME_PX));
}

/** Identity block: the full name plus, when shown, the job-title subtitle. */
function identityMm(info: PersonalInfo, m: LayoutMetrics): number {
  return m.lineMm(EM_NAME) + (info.fieldVisibility.jobTitle ? pxToMm(2) + m.lineMm(EM_SUBTITLE) : 0);
}

/**
 * Contacts + links area. They share a flexible row that wraps in practice, so
 * count wrapped rows generously (≈2 contacts per row, one row per link). In a
 * narrow column (the photo asides) the chips wrap one-per-row, so reserve a row
 * per contact field there. The per-link row is NOT a phantom: a link chip
 * paints label + URL and measured ~a full row each in the live /print DOM
 * (3 long links = 52.1mm painted vs 41.0mm under a 2-per-row pooled model),
 * so pooling links with the contacts under-reserves the header.
 */
function contactsMm(info: PersonalInfo, m: LayoutMetrics, perRow = 2): number {
  const { fieldVisibility } = info;
  const contactFields = [
    fieldVisibility.phone,
    fieldVisibility.email,
    fieldVisibility.location,
    fieldVisibility.dateOfBirth,
    fieldVisibility.nationality,
    fieldVisibility.militaryService,
  ].filter(Boolean).length;
  const contactRows = contactFields > 0 ? Math.ceil(contactFields / perRow) : 0;
  const linkRows = fieldVisibility.links ? info.links.length : 0;
  return (contactRows + linkRows) * (m.lineMm(EM_BODY) + pxToMm(4));
}

export function estimatePersonalInfoHeight(info: PersonalInfo, m: LayoutMetrics): number {
  const rightColumnMm = identityMm(info, m) + pxToMm(8) + contactsMm(info, m);
  const photoMm = info.fieldVisibility.photo ? pxToMm(PROFILE_PHOTO_PX) : 0;

  // Bottom padding (pb=3) + 2px accent underline.
  return Math.max(rightColumnMm, photoMm) + pxToMm(12) + pxToMm(2);
}

export interface PersonalBlockEstimate {
  /** Include the name + job-title identity block. */
  identity?: boolean;
  /** Include the contacts + links row. */
  contacts?: boolean;
  /** Include the profile photo (also honours the photo visibility toggle). */
  photo?: boolean;
  /** Photo edge size in px (defaults to the header default). */
  photoSizePx?: number;
  /** "row" = identity/contacts column sits beside the photo (max of the two);
   *  "stack" = photo stacked above the text (vertical sum). */
  layout?: "row" | "stack";
  /** Contacts chips per row — 1 in a narrow aside, 2 in a full-width header. */
  contactsPerRow?: number;
  /** Extra fixed chrome in px (divider / band padding / bordered strip / trailing gap). */
  extraPx?: number;
}

/**
 * Flexible estimator for the per-template header / aside-leading personal block,
 * so the column engine can reserve the right space on page 1 for whichever pieces
 * a template renders there (a full-width header, a photo+contacts aside, or just
 * the identity in the main column).
 */
export function estimatePersonalBlockHeight(
  info: PersonalInfo,
  m: LayoutMetrics,
  opts: PersonalBlockEstimate,
): number {
  const idMm = opts.identity ? identityMm(info, m) : 0;
  const conMm = opts.contacts ? contactsMm(info, m, opts.contactsPerRow ?? 2) : 0;
  const textMm = idMm + (idMm > 0 && conMm > 0 ? pxToMm(8) : 0) + conMm;
  const photoMm = opts.photo && info.fieldVisibility.photo ? pxToMm(opts.photoSizePx ?? PROFILE_PHOTO_PX) : 0;

  const coreMm =
    opts.layout === "stack"
      ? textMm + (photoMm > 0 ? photoMm + pxToMm(8) : 0)
      : Math.max(textMm, photoMm);

  return coreMm + pxToMm(opts.extraPx ?? 0);
}

export function estimateSectionTitleHeight(
  m: LayoutMetrics,
  hasContent: boolean,
  withIcon = false,
): number {
  // The opt-in title separator needs NO term here: it is an absolute overlay
  // centred in the frame's existing title→content corridor (see
  // SectionSeparator), so it adds zero in-flow height — the reserve is
  // identical with it on or off.
  //
  // The reserve is the classic (theme-line-height-proportional) factor, floored
  // by the EXACT painted title-row model — which does NOT follow the theme
  // line-height: SectionFrame's symmetric 0.9em pads around the taller of the
  // heading's own tight 1.15 line-box and (with icons on) the 1.6em icon chip,
  // plus the frame's fixed 2px title→content gap. All em terms are of the
  // scaled base font, so the floor tracks the font-size slider exactly; it
  // protects the icons-on row (24px > the 18.6px text line at every scale) and
  // condensed theme line-heights, where the classic factor alone under-prices.
  //
  // `m.sectionTitleEm` lets a template pin the em it actually PAINTS the heading
  // at (the timeline-panel design's 19px main / 14px panel headings); unset — every
  // other template — keeps the shared EM_SECTION_TITLE, so their reserve is
  // byte-identical.
  const titleEm = m.sectionTitleEm ?? EM_SECTION_TITLE;
  const paintedRowMm =
    m.emMm(
      2 * SECTION_TITLE_PAD_EM +
        Math.max(titleEm * SECTION_TITLE_TEXT_LINE_HEIGHT, withIcon ? SECTION_ICON_BOX_EM : 0),
    ) + pxToMm(SECTION_TITLE_CONTENT_GAP_PX);
  // A template that PINS its title em paints exactly the modelled row, so the
  // reserve is that row alone — the legacy line-height-proportional factor
  // overshoots a large pinned heading (it grows with em × theme line-height
  // while the painted row grows only with em × the tight 1.15 box) and left a
  // visible dead strip under every section. The shared scale (no pin) keeps the
  // classic factor byte-identical.
  const titleMm =
    m.sectionTitleEm != null
      ? paintedRowMm
      : Math.max(SECTION_TITLE_LINE_FACTOR * m.lineMm(titleEm), paintedRowMm);
  // An empty section reserves a little extra space for its guidance/affordances.
  return hasContent ? titleMm : titleMm + 2 * m.lineMm(EM_BODY);
}

export function estimateSummaryHeight(html: string, m: LayoutMetrics): number {
  // The summary renders across the full flow width, so its wrap capacity is the
  // width-true model at that width (identical to the legacy calibrated constant
  // at the 178mm reference — 105 chars — but honest in a narrow column flow and
  // floor-biased across the font-scale range). A template may pin the painted em
  // (see LayoutMetrics.summaryEm); unset keeps the shared size byte-identical.
  const em = m.summaryEm ?? EM_SUMMARY;
  const lines = Math.max(1, estimateHtmlLines(html, m.wrapCharsPerLine(m.contentWidthMm, em)));
  return lines * proseLineMm(m, em, m.proseLineHeights?.summary) + pxToMm(8);
}

/**
 * Height breakdown of one Experience entry, exposed so the packer can BREAK an
 * over-page entry between responsibility rows (a 30-bullet entry is taller than
 * a whole page — unsplittable, it would overflow whatever page it lands on).
 * `totalMm` is the classic whole-item estimate; the parts reconstruct it:
 * `max(headMm + listTopMm + Σ bulletMm, dateColumnMm) + tailMm`.
 */
export interface ExperienceItemEstimate {
  /** Everything above the responsibilities list: titles, link row, description. */
  headMm: number;
  /** The responsibilities list's own top margin (mt=4, 16px). */
  listTopMm: number;
  /** Each responsibility row (its wrapped text or the taller marker/title floor, plus the row gap). */
  bulletMm: number[];
  /** The date/city column's height floor (start + end date + city). */
  dateColumnMm: number;
  /** The entry's bottom padding (pb=1.5). */
  tailMm: number;
  totalMm: number;
}

export function estimateExperienceItemParts(
  item: ExperienceItem,
  section: SectionMeta,
  m: LayoutMetrics,
): ExperienceItemEstimate {
  // STACKED composition (the timeline-panel design, exclusive to flows that opt
  // in): no date column and no per-entry rail — the title, the one-line
  // «start – end | company» meta row, the optional link/description rows and the
  // bullet list all span the flow width (minus the pe=6 control clearance), at
  // the design's pinned type. Mirrors the block's stacked paint exactly.
  if (m.stackedEntries) {
    const textMm = Math.max(15, m.contentWidthMm - pxToMm(EXP_MAIN_END_PAD_PX));
    const bulletWidthMm = Math.max(15, textMm - pxToMm(STACKED_BULLET_MARKER_COL_PX));
    const bulletCharsPerLine = m.wrapCharsPerLine(bulletWidthMm, STACKED_BULLET_EM);
    const descCharsPerLine = m.wrapCharsPerLine(textMm, STACKED_BULLET_EM);

    const bodyLh = m.proseLineHeights?.body;
    const bulletMm = item.responsibilities.map(
      (responsibility) =>
        Math.max(
          proseLineMm(m, STACKED_BULLET_EM, bodyLh),
          multilineMm(m, STACKED_BULLET_EM, responsibility.text, bulletCharsPerLine, bodyLh),
        ) + pxToMm(STACKED_BULLET_GAP_PX),
    );

    // The meta row holds the dates, the company and the city on one flex line;
    // it wraps only when their combined text outgrows the row.
    const metaChars = `${item.companyName} ${item.city}`.length + 14;
    const metaLines = Math.max(1, Math.ceil(metaChars / m.wrapCharsPerLine(textMm, STACKED_ENTRY_META_EM)));

    const headMm =
      // The stacked title END-ELLIPSIZES on both surfaces (truncateEnd), so it
      // is exactly one line at any length.
      m.lineMm(STACKED_ENTRY_TITLE_EM) +
      metaLines * m.lineMm(STACKED_ENTRY_META_EM) +
      (shouldRenderProjectLink(item) ? proseLineMm(m, STACKED_BULLET_EM, bodyLh) : 0) +
      multilineMm(m, STACKED_BULLET_EM, item.projectDescription, descCharsPerLine, bodyLh) +
      // The stack's 2px row gaps (title, meta, description, + link when shown).
      pxToMm(2 * (3 + (shouldRenderProjectLink(item) ? 1 : 0)));

    const listTopMm = pxToMm(STACKED_LIST_TOP_PX);
    const tailMm = pxToMm(6); // pb=1.5
    const mainColumnMm = headMm + listTopMm + bulletMm.reduce((total, mm) => total + mm, 0);
    return { headMm, listTopMm, bulletMm, dateColumnMm: 0, tailMm, totalMm: mainColumnMm + tailMm };
  }

  // The date column narrows when the month is hidden or numeric, widening the
  // main column. `periodDateColumnMm` is the SAME mapping the block sets its
  // `width` from, and the wrap capacities are priced at each field's REAL
  // rendered width: main column minus the pe=6 control clearance for the
  // description, minus the "•" marker column for a responsibility row.
  const mainMm = entryMainColumnMm(m, periodDateColumnMm(section.showMonth, section.monthFormat));
  const descWidthMm = Math.max(15, mainMm - pxToMm(EXP_MAIN_END_PAD_PX));
  const bulletWidthMm = Math.max(15, descWidthMm - pxToMm(BULLET_MARKER_COL_PX));
  const descCharsPerLine = m.wrapCharsPerLine(descWidthMm, EM_BODY);
  const bulletCharsPerLine = m.wrapCharsPerLine(bulletWidthMm, EM_BODY);

  const bulletMm = item.responsibilities.map(
    // Each bullet row is at least the (taller) bullet glyph line — the fixed
    // 21px "•" marker box, measured in the live DOM — then grows with the
    // wrapped text; pxToMm(4) is the real inter-bullet gap (VStack gap=1).
    (responsibility) =>
      Math.max(
        m.lineMm(EM_ITEM_TITLE),
        pxToMm(LIST_BULLET_LINE_PX),
        multilineMm(m, EM_BODY, responsibility.text, bulletCharsPerLine),
      ) + pxToMm(4),
  );

  const headMm =
    2 * m.lineMm(EM_ITEM_TITLE) + // job title + company
    // The link row is counted iff it is rendered — the SAME shared predicate the
    // block renders by (mirrors estimateProjectItemHeight).
    (shouldRenderProjectLink(item) ? m.lineMm(EM_BODY) : 0) +
    multilineMm(m, EM_BODY, item.projectDescription, descCharsPerLine) + // project description (always rendered)
    // The entry stack's 2px row gaps — one per row above the list (title,
    // company, description, and the link row when it renders).
    pxToMm(2 * (3 + (shouldRenderProjectLink(item) ? 1 : 0)));

  // The responsibilities list's mt="4" (16px), measured in the live DOM.
  // Responsibilities are a keyboard-driven list (Enter adds, Backspace
  // removes), so no "add" button takes vertical space.
  const listTopMm = pxToMm(16);

  // Date column: start + end DateField (each a single-line trigger; the end date
  // is always shown — «تا اکنون» lives inside its popover, not as a separate
  // button) + city, with the small inter-field gaps.
  const dateColumnMm = 3 * m.lineMm(EM_BODY) + pxToMm(20);

  const tailMm = pxToMm(6); // pb=1.5
  const mainColumnMm = headMm + listTopMm + bulletMm.reduce((total, mm) => total + mm, 0);
  return {
    headMm,
    listTopMm,
    bulletMm,
    dateColumnMm,
    tailMm,
    totalMm: Math.max(mainColumnMm, dateColumnMm) + tailMm,
  };
}

export function estimateExperienceItemHeight(
  item: ExperienceItem,
  section: SectionMeta,
  m: LayoutMetrics,
): number {
  return estimateExperienceItemParts(item, section, m).totalMm;
}

/** The plain panel skill list broken into split parts (see {@link BlockSplitMeta}):
 *  the group title as the head, one unit per skill row (each carrying the 10px
 *  inter-row gap except the first), and the pb=2 tail. Lets a long list run out
 *  the bottom of a page and continue on the next one (splitToFill) instead of
 *  jumping whole. */
export interface PlainSkillGroupEstimate {
  headMm: number;
  unitMm: number[];
  tailMm: number;
  totalMm: number;
}

export function estimatePlainSkillGroupParts(
  group: SkillGroup,
  m: LayoutMetrics,
): PlainSkillGroupEstimate {
  const headMm = group.showTitle ? m.lineMm(EM_ITEM_TITLE) + pxToMm(2) : 0;
  const chars = m.wrapCharsPerLine(Math.max(15, m.contentWidthMm - pxToMm(24)), STACKED_BULLET_EM);
  const rowsMm = (group.skills.length > 0 ? group.skills : [{ name: "" }]).map(
    (skill) => Math.max(1, Math.ceil(Math.max(1, skill.name.length) / chars)) * m.lineMm(STACKED_BULLET_EM),
  );
  // Each row above the first carries the list's 10px gap; the first sits under
  // the head (or the run top) directly.
  const unitMm = rowsMm.map((rowMm, i) => rowMm + (i > 0 ? pxToMm(10) : 0));
  const tailMm = pxToMm(8); // pb=2
  return {
    headMm,
    unitMm,
    tailMm,
    totalMm: headMm + unitMm.reduce((total, mm) => total + mm, 0) + tailMm,
  };
}

export function estimateSkillGroupHeight(
  group: SkillGroup,
  section: SectionMeta,
  m: LayoutMetrics,
): number {
  // The group-title line renders only when this group's own toggle keeps it.
  const titleMm = group.showTitle ? m.lineMm(EM_ITEM_TITLE) + pxToMm(2) : 0;

  if (section.skillDisplayMode === "list") {
    // Bare panel rows (the timeline-panel design): marker-less 11.5px lines on
    // a 10px gap with no list top margin — the exact plain paint. A long name
    // WRAPS on the print surface, so each row prices its wrapped lines.
    if (m.plainSkillList) {
      return estimatePlainSkillGroupParts(group, m).totalMm;
    }
    // List mode mirrors the responsibilities pricing: each row is at least the
    // (taller) bullet glyph line — the same fixed 21px "•" marker box the
    // responsibility rows carry, which governs the row over the xs skill-name
    // text — plus the 4px stack gap. List mode is text-only — the level meter
    // renders only in tag-row mode.
    const rowMm =
      Math.max(m.lineMm(EM_ITEM_TITLE), pxToMm(LIST_BULLET_LINE_PX), m.lineMm(EM_BODY)) +
      pxToMm(4);
    const rows = Math.max(1, group.skills.length);
    return titleMm + pxToMm(8) + rows * rowMm + pxToMm(12); // mt=8px + pb=2 + safety
  }

  // Tag-row mode. Each tag AUTO-SIZES to its skill name (the input grows to its
  // content), so the row count follows the summed chip widths — the old fixed
  // 4-per-row cap priced a phantom extra row for every group of short names.
  // A chip's width is its text advance (the same biased-wide char model the
  // wrap capacities use, floored at the ~6-char placeholder for an empty name)
  // plus fixed on-screen chrome: paddingInline 2px×2 + the 6px gap + the
  // in-flow 22px hover trash (no-print, so the PDF paints narrower — pricing
  // the wider editor chip is the safe, taller reserve), plus the Wrap's 12px
  // inter-chip gap counted per chip (over-reserving one gap per row). A
  // beside-name level meter widens every chip by its rendered box + gap.
  const advanceMm = CHAR_MM_PER_FONT_PX * m.emMm(EM_BODY) * PX_PER_MM;
  const meterMm = !section.skillShowLevel
    ? 0
    : (section.skillMeterVariant === "bars" ? 10 : section.skillMeterVariant === "dots" ? 24 : 20) +
      pxToMm(6);
  const chipMm = (chars: number) =>
    Math.max(chars, 6) * advanceMm + meterMm + pxToMm(2 + 2 + 6 + 22 + 12);
  // The trailing "add skill" button (26px + gap) shares the wrap as one more slot.
  const slots = [...group.skills.map((skill) => chipMm(skill.name.length)), pxToMm(26 + 12)];
  let chipRows = 1;
  let rowUsedMm = 0;
  for (const slot of slots) {
    const width = Math.min(slot, m.contentWidthMm); // an over-wide chip still occupies one row
    if (rowUsedMm > 0 && rowUsedMm + width > m.contentWidthMm) {
      chipRows += 1;
      rowUsedMm = 0;
    }
    rowUsedMm += width;
  }
  // Painted vertical model, exact: the Wrap's mt=8px, the tags' FIXED 30px
  // height (structural chrome — the xs text sits inside it at every font
  // scale), the 8px rowGap between rows, and the group's pb=2 (8px).
  return titleMm + pxToMm(8) + chipRows * pxToMm(30) + (chipRows - 1) * pxToMm(8) + pxToMm(8);
}

export function estimateEducationItemHeight(
  item: EducationItem,
  section: SectionMeta,
  m: LayoutMetrics,
): number {
  // Narrow-column (stacked) composition: no date column and no rail, so the whole
  // column width carries the text — the period + city share ONE row above the
  // entry, and the degree/university are priced as WRAPPING text (in a column
  // this narrow they really do wrap on the print surface, where the editor's
  // single-line inputs become flowing spans).
  if (m.stackedEntries) {
    // Reference-pinned panel type: 11px period, 12px degree, 11.5px school
    // (the exact sizes the stacked block paints — see EducationItemBlock).
    const textMm = Math.max(15, m.contentWidthMm - pxToMm(EDU_REMOVE_COL_PX));
    const titleChars = m.wrapCharsPerLine(textMm, STACKED_EDU_TITLE_EM);
    const subtitleChars = m.wrapCharsPerLine(textMm, STACKED_EDU_SUBTITLE_EM);
    const bodyChars = m.wrapCharsPerLine(textMm, EM_BODY);
    const lines = (text: string, chars: number) => Math.max(1, Math.ceil(text.length / chars));
    return (
      // Period row + the city, which wraps onto its own row in a narrow column.
      2 * m.lineMm(STACKED_EDU_META_EM) +
      lines(item.degree, titleChars) * m.lineMm(STACKED_EDU_TITLE_EM) +
      lines(item.university, subtitleChars) * m.lineMm(STACKED_EDU_SUBTITLE_EM) +
      m.lineMm(EM_BODY) + // gpa row
      multilineMm(m, EM_BODY, item.achievements, bodyChars) +
      pxToMm(10) + // the stack's 2px row gaps
      pxToMm(6) // pb=1.5
    );
  }

  // Same date-column-conditional main column as the experience entry, but the
  // wrap width additionally loses the IN-FLOW remove control (Education's
  // trash button participates in layout, unlike Experience's overlay) — the
  // achievements field really wraps at mainColumn − 32px in the live DOM.
  const mainMm = entryMainColumnMm(m, periodDateColumnMm(section.showMonth, section.monthFormat));
  const achWidthMm = Math.max(15, mainMm - pxToMm(EDU_REMOVE_COL_PX));
  const charsPerLine = m.wrapCharsPerLine(achWidthMm, EM_BODY);

  const mainColumnMm =
    2 * m.lineMm(EM_ITEM_TITLE) + // degree + university
    m.lineMm(EM_BODY) + // gpa row
    multilineMm(m, EM_BODY, item.achievements, charsPerLine) + // achievements (always rendered)
    pxToMm(10);

  // Date column mirrors the experience entry: start + end DateField + city.
  const dateColumnMm = 3 * m.lineMm(EM_BODY) + pxToMm(20);

  return Math.max(mainColumnMm, dateColumnMm) + pxToMm(6); // pb=1.5
}

export function estimateProjectItemHeight(
  item: ProjectItem,
  m: LayoutMetrics,
  /** Grid column count of the painted Projects layout (1 = the shared list). */
  cols = 1,
): number {
  // 2-up sub-grid CELL (the timeline-panel design, exclusive to flows that opt
  // in): reference-pinned type at the cell's real width — name, the plain link
  // row, then the wrapping description. Mirrors the block's grid paint exactly.
  if (cols > 1) {
    const cellWidthMm =
      (m.contentWidthMm - PROJECT_GRID_COL_GAP_MM * (cols - 1)) / cols - pxToMm(EXP_MAIN_END_PAD_PX);
    const nameLines = Math.max(
      1,
      Math.ceil(Math.max(1, item.name.length) / m.wrapCharsPerLine(cellWidthMm, PROJECT_CELL_TITLE_EM)),
    );
    let mm =
      nameLines * m.lineMm(PROJECT_CELL_TITLE_EM) +
      multilineMm(
        m,
        PROJECT_CELL_DESC_EM,
        item.description,
        m.wrapCharsPerLine(cellWidthMm, PROJECT_CELL_DESC_EM),
        m.proseLineHeights?.body,
      ) +
      pxToMm(4); // the reference's 1px link + 3px description offsets
    if (shouldRenderProjectLink(item)) mm += m.lineMm(PROJECT_CELL_LINK_EM);
    return mm;
  }

  let mm =
    m.lineMm(EM_ITEM_TITLE) + // name + role row
    multilineMm(m, EM_BODY, item.description) + // description (always rendered)
    // Painted structural gaps, measured in the live DOM: the header group's
    // mb=6px + two 2px stack gaps (+2px slack).
    pxToMm(12) +
    pxToMm(8); // pb=2
  // The link row is counted iff it is actually rendered — the SAME shared
  // predicate ProjectItemBlock renders by, so editor, /print and the estimate
  // can never disagree about this row's existence.
  if (shouldRenderProjectLink(item)) mm += m.lineMm(EM_BODY); // link
  return mm;
}

/**
 * One row of the Languages grid (up to {@link languageGridColumns} cells — the
 * chunking in `buildBlocks` is width-derived exactly like the achievements
 * grid, so a narrow column packs 2-up / stacked rows). Unlike the achievements
 * cell, the height needs NO cols(W) term: every cell is single-line
 * non-wrapping text (the name is a native input, the level word a nowrap
 * single-liner) beside fixed-px meter boxes, so a cell is the same height at
 * every column width. Every cell obeys the SECTION-WIDE display settings, so
 * the row height is uniform and exact — no term is guessed:
 *
 * - "line" variant: the level word sits INLINE with the name (one text line)
 *   and the full-width track stacks below it — name line, plus the fixed
 *   gap + track when the meter shows.
 * - beside-text variants (bars/dots/pill): the name (sm) over the level word
 *   (xs) with the meter beside, capped at the fixed bar-height box — the cell
 *   is the taller of the text stack and that box (the meter can win at small
 *   font scales).
 *
 * Both close with the cell's vertical p=3 padding (which clears the hover
 * trash) plus the safety sliver. Texts are non-wrapping single-liners and the
 * meter boxes are shared constants, so estimator and renderer read identical
 * geometry.
 */
export function estimateLanguageRowHeight(section: SectionMeta, m: LayoutMetrics): number {
  // Narrow-column (stacked) cell: name (+ level word share one baseline row) on
  // top, the COMPACT meter on its own row (mt=1) below, at the tighter p=1.5
  // padding (6px top + 6px bottom) — the exact geometry LanguageItemBlock's
  // stacked branch paints. The line variant keeps its full-width track.
  if (m.stackedEntries) {
    const textRowMm = m.lineMm(EM_ITEM_TITLE);
    let meterMm = 0;
    if (section.languageShowMeter) {
      if (section.languageMeterVariant === "line") {
        meterMm = pxToMm(LANGUAGE_LINE_GAP_PX + LANGUAGE_LINE_TRACK_PX);
      } else {
        const boxPx =
          section.languageMeterVariant === "bars"
            ? LANGUAGE_BAR_HEIGHT_COMPACT_PX
            : LANGUAGE_METER_BOX_COMPACT_PX;
        meterMm = pxToMm(4 + boxPx); // mt=1 (4px) + the compact meter box
      }
    }
    return textRowMm + meterMm + pxToMm(12 + 3); // p=1.5 (12px) + safety sliver
  }
  // Vertical cell chrome: the p=3 padding (12px top + 12px bottom) that clears
  // the hover trash around the content, plus the usual safety sliver.
  const cellChromeMm = pxToMm(28);
  if (section.languageMeterVariant === "line") {
    const trackMm = section.languageShowMeter
      ? pxToMm(LANGUAGE_LINE_GAP_PX + LANGUAGE_LINE_TRACK_PX)
      : 0;
    return m.lineMm(EM_ITEM_TITLE) + trackMm + cellChromeMm; // text line + track + padding + safety
  }
  const levelWordMm = section.languageShowLevelText ? m.lineMm(EM_BODY) : 0;
  const textStackMm = m.lineMm(EM_ITEM_TITLE) + levelWordMm;
  // The bars variant renders taller bars than the compact dots/pill box, so
  // the reserved meter box follows the variant — same constants the meter
  // paints with.
  const meterBoxPx =
    section.languageMeterVariant === "bars" ? LANGUAGE_BAR_HEIGHT_PX : LANGUAGE_METER_BOX_PX;
  const meterMm = section.languageShowMeter ? pxToMm(meterBoxPx) : 0;
  return Math.max(textStackMm, meterMm) + cellChromeMm; // tallest cell + padding + safety
}

export function estimateCertificationItemHeight(m: LayoutMetrics): number {
  // One-line composition (the timeline-panel design): name … issuer · date share
  // a single baseline row, whose height the larger name type governs.
  if (m.certInlineMeta) return m.lineMm(CERT_INLINE_NAME_EM) + pxToMm(6); // row + pb=1.5
  return m.lineMm(EM_ITEM_TITLE) + m.lineMm(EM_BODY) + pxToMm(8); // name + issuer/date + pb=1.5
}

/**
 * One Key-Achievements grid cell: the diamond icon beside a text stack of the
 * (always-shown, wrapping) title and, when the section shows it, the grey
 * description. Wrap capacities scale from `bodyCharsPerLine` by the ratio of
 * the cell's real TEXT width to the flow's full content width (the
 * `entryBodyCharsPerLine` mechanism), and the title's capacity additionally by
 * the em ratio (chars-per-line ∝ 1/font-size). The icon column and the cell's
 * vertical chrome are fixed-px shared constants, so paint and reserve read
 * identical geometry. `cols` MUST be the {@link achievementGridColumns} value
 * the row chunking used, so the assumed cell width matches the painted grid.
 */
export function estimateAchievementItemHeight(
  item: AchievementItem,
  section: SectionMeta,
  m: LayoutMetrics,
  cols: number,
): number {
  // PLAIN BULLET row (the timeline-panel design): one body-tier run behind the
  // fixed marker column, at the reference's pinned size and line-height.
  if (m.achievementBullets) {
    const lh = m.proseLineHeights?.achievement;
    const textMm = Math.max(
      15,
      m.contentWidthMm - pxToMm(ACHIEVEMENT_BULLET_MARKER_COL_PX) - pxToMm(EXP_MAIN_END_PAD_PX),
    );
    const titleMm = multilineMm(
      m,
      ACHIEVEMENT_BULLET_EM,
      item.title,
      m.wrapCharsPerLine(textMm, ACHIEVEMENT_BULLET_EM),
      lh,
    );
    const descMm = section.achievementShowDescription
      ? multilineMm(m, EM_BODY, item.description, m.wrapCharsPerLine(textMm, EM_BODY), lh)
      : 0;
    return titleMm + descMm + pxToMm(6); // pb=1.5
  }

  const cellWidthMm = (m.contentWidthMm - ACHIEVEMENT_GRID_GAP_MM * (cols - 1)) / cols;
  const iconColMm = section.achievementShowIcons ? pxToMm(ACHIEVEMENT_ICON_COL_PX) : 0;
  const widthRatio = Math.max(0.1, (cellWidthMm - iconColMm) / m.contentWidthMm);

  // Wrap capacities round DOWN: a rounded-up capacity under-counts lines (the
  // one direction the estimates must never err — proven at the 51.2mm side
  // column, where round() gave 22 chars/line vs Chrome's real ~21 and priced a
  // 4-line title at 3), while flooring can only over-reserve a touch.
  const titleChars = Math.max(
    12,
    Math.floor(m.bodyCharsPerLine * widthRatio * (EM_BODY / EM_ITEM_TITLE)),
  );
  const titleMm =
    Math.max(MULTILINE_ROWS, estimateHtmlLines(item.title, titleChars)) * m.lineMm(EM_ITEM_TITLE);

  const descMm = section.achievementShowDescription
    ? multilineMm(m, EM_BODY, item.description, Math.max(12, Math.floor(m.bodyCharsPerLine * widthRatio)))
    : 0;

  const iconMm = section.achievementShowIcons ? pxToMm(ACHIEVEMENT_ICON_BOX_PX) : 0;
  return Math.max(titleMm + descMm, iconMm) + pxToMm(ACHIEVEMENT_CELL_PAD_PX);
}
