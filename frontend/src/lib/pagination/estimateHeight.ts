import type {
  EducationItem,
  ExperienceItem,
  PersonalInfo,
  ProjectItem,
  SectionMeta,
  SkillGroup,
} from "@/types";
import { shouldRenderProjectLink } from "@/lib/resume/projectLink";
import {
  DATE_COLUMN_MONTH_NAME_MM,
  EM_BODY,
  EM_ITEM_TITLE,
  EM_NAME,
  EM_SECTION_TITLE,
  EM_SUBTITLE,
  EM_SUMMARY,
  LANGUAGE_BAR_HEIGHT_PX,
  LANGUAGE_LINE_GAP_PX,
  LANGUAGE_LINE_TRACK_PX,
  LANGUAGE_METER_BOX_PX,
  MULTILINE_ROWS,
  TIMELINE_CHROME_PX,
  periodDateColumnMm,
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

const PROFILE_PHOTO_PX = 88; // ProfileImageEditor default size
/** Most skill chips that fit on one row at the full content width (an upper cap). */
const SKILL_CHIPS_PER_ROW = 4;
/**
 * Approximate rendered width (mm) of one skill chip incl. its gap. Dividing the
 * column content width by this gives how many chips share a row, so a narrow side
 * column (where chips wrap to ~2 per row) reserves the taller, correct height
 * instead of assuming the full-width count and under-counting the section.
 */
const SKILL_CHIP_SLOT_MM = 30;
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
): number {
  const lines = Math.max(MULTILINE_ROWS, estimateHtmlLines(html, charsPerLine));
  return lines * m.lineMm(em);
}

/**
 * Wrap capacity of an entry's MAIN column. `bodyCharsPerLine` was calibrated
 * with the widest (month-name, 25mm) date column in place; a narrower date
 * column widens the main column, so the capacity scales by the ratio of the two
 * real main-column widths (column width minus date column minus the fixed
 * rail/gap chrome). Every term is a shared renderer constant.
 */
function entryBodyCharsPerLine(m: LayoutMetrics, dateColumnMm: number): number {
  const chromeMm = pxToMm(TIMELINE_CHROME_PX);
  const referenceMainMm = m.contentWidthMm - DATE_COLUMN_MONTH_NAME_MM - chromeMm;
  const mainMm = m.contentWidthMm - dateColumnMm - chromeMm;
  if (referenceMainMm <= 0 || mainMm <= 0) return m.bodyCharsPerLine;
  return Math.max(12, Math.round(m.bodyCharsPerLine * (mainMm / referenceMainMm)));
}

/** Identity block: the full name plus, when shown, the job-title subtitle. */
function identityMm(info: PersonalInfo, m: LayoutMetrics): number {
  return m.lineMm(EM_NAME) + (info.fieldVisibility.jobTitle ? pxToMm(2) + m.lineMm(EM_SUBTITLE) : 0);
}

/**
 * Contacts + links area. They share a flexible row that wraps in practice, so
 * count wrapped rows generously (≈2 contacts per row, one row per link). In a
 * narrow column (the photo asides) the chips wrap one-per-row, so reserve a row
 * per contact field there.
 */
function contactsMm(info: PersonalInfo, m: LayoutMetrics, perRow = 2): number {
  const { fieldVisibility } = info;
  const contactFields = [
    fieldVisibility.phone,
    fieldVisibility.email,
    fieldVisibility.location,
    fieldVisibility.dateOfBirth,
    fieldVisibility.nationality,
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

export function estimateSectionTitleHeight(m: LayoutMetrics, hasContent: boolean): number {
  const titleMm = SECTION_TITLE_LINE_FACTOR * m.lineMm(EM_SECTION_TITLE);
  // An empty section reserves a little extra space for its guidance/affordances.
  return hasContent ? titleMm : titleMm + 2 * m.lineMm(EM_BODY);
}

export function estimateSummaryHeight(html: string, m: LayoutMetrics): number {
  const lines = Math.max(1, estimateHtmlLines(html, m.charsPerLine));
  return lines * m.lineMm(EM_SUMMARY) + pxToMm(8);
}

export function estimateExperienceItemHeight(
  item: ExperienceItem,
  section: SectionMeta,
  m: LayoutMetrics,
): number {
  // The date column narrows when the month is hidden or numeric, widening the
  // main column, so the wrap capacity is conditional on the section settings.
  // `periodDateColumnMm` is the SAME mapping the block sets its `width` from.
  const charsPerLine = entryBodyCharsPerLine(
    m,
    periodDateColumnMm(section.showMonth, section.monthFormat),
  );

  const responsibilitiesMm = item.responsibilities.reduce(
    // Each bullet row is at least the (taller) bullet glyph line, then grows with
    // the wrapped text; pxToMm(4) is the real inter-bullet gap (VStack gap=1).
    (total, responsibility) =>
      total +
      Math.max(m.lineMm(EM_ITEM_TITLE), multilineMm(m, EM_BODY, responsibility.text, charsPerLine)) +
      pxToMm(4),
    0,
  );

  const mainColumnMm =
    2 * m.lineMm(EM_ITEM_TITLE) + // job title + company
    // The link row is counted iff it is rendered — the SAME shared predicate the
    // block renders by (mirrors estimateProjectItemHeight).
    (shouldRenderProjectLink(item) ? m.lineMm(EM_BODY) : 0) +
    multilineMm(m, EM_BODY, item.projectDescription, charsPerLine) + // project description (always rendered)
    responsibilitiesMm +
    // Responsibilities are a keyboard-driven list (Enter adds, Backspace removes),
    // so there is no longer an "add responsibility" button taking vertical space.
    pxToMm(16); // accumulated 0.5-unit field gaps + safety

  // Date column: start + end DateField (each a single-line trigger; the end date
  // is always shown — «تا اکنون» lives inside its popover, not as a separate
  // button) + city, with the small inter-field gaps.
  const dateColumnMm = 3 * m.lineMm(EM_BODY) + pxToMm(20);

  return Math.max(mainColumnMm, dateColumnMm) + pxToMm(6); // pb=1.5
}

export function estimateSkillGroupHeight(group: SkillGroup, m: LayoutMetrics): number {
  // Chips per row scale with the real column width (capped at the full-width count),
  // so a narrow side column reserves the extra wrapped rows instead of overflowing.
  const chipsPerRow = Math.max(
    1,
    Math.min(SKILL_CHIPS_PER_ROW, Math.round(m.contentWidthMm / SKILL_CHIP_SLOT_MM)),
  );
  // The trailing "add skill" button shares the wrap, so reserve one extra slot.
  const chipRows = Math.max(1, Math.ceil((group.skills.length + 1) / chipsPerRow));
  const chipRowMm = m.lineMm(EM_BODY) + pxToMm(4) + pxToMm(10); // chip padding + wrap gap
  return m.lineMm(EM_ITEM_TITLE) + pxToMm(2) + chipRows * chipRowMm + pxToMm(12); // pb=2 + safety
}

export function estimateEducationItemHeight(
  item: EducationItem,
  section: SectionMeta,
  m: LayoutMetrics,
): number {
  // Same date-column-conditional wrap capacity as the experience entry.
  const charsPerLine = entryBodyCharsPerLine(
    m,
    periodDateColumnMm(section.showMonth, section.monthFormat),
  );

  const mainColumnMm =
    2 * m.lineMm(EM_ITEM_TITLE) + // degree + university
    m.lineMm(EM_BODY) + // gpa row
    multilineMm(m, EM_BODY, item.achievements, charsPerLine) + // achievements (always rendered)
    pxToMm(10);

  // Date column mirrors the experience entry: start + end DateField + city.
  const dateColumnMm = 3 * m.lineMm(EM_BODY) + pxToMm(20);

  return Math.max(mainColumnMm, dateColumnMm) + pxToMm(6); // pb=1.5
}

export function estimateProjectItemHeight(item: ProjectItem, m: LayoutMetrics): number {
  let mm =
    m.lineMm(EM_ITEM_TITLE) + // name + role row
    multilineMm(m, EM_BODY, item.description) + // description (always rendered)
    pxToMm(8) +
    pxToMm(8); // pb=2
  // The link row is counted iff it is actually rendered — the SAME shared
  // predicate ProjectItemBlock renders by, so editor, /print and the estimate
  // can never disagree about this row's existence.
  if (shouldRenderProjectLink(item)) mm += m.lineMm(EM_BODY); // link
  return mm;
}

/**
 * One row of the Languages grid (up to LANGUAGE_GRID_COLUMNS cells). Every cell
 * obeys the SECTION-WIDE display settings, so the row height is uniform and
 * exact — no term is guessed:
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
  return m.lineMm(EM_ITEM_TITLE) + m.lineMm(EM_BODY) + pxToMm(8); // name + issuer/date + pb=1.5
}
