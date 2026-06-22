import type {
  EducationItem,
  ExperienceItem,
  PersonalInfo,
  ProjectItem,
  SkillGroup,
} from "@/types";
import {
  CONTROL_BUTTON_PX,
  EM_BODY,
  EM_ITEM_TITLE,
  EM_NAME,
  EM_SECTION_TITLE,
  EM_SUBTITLE,
  EM_SUMMARY,
  MULTILINE_ROWS,
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
const SKILL_CHIPS_PER_ROW = 4;
/**
 * The section heading block measures ~2.4 rendered line-heights in the flow
 * (tall heading line-box plus the space its inline toolbar anchor reserves).
 */
const SECTION_TITLE_LINE_FACTOR = 2.4;

/**
 * A multiline field auto-grows to fit its content but never shrinks below its
 * two-row minimum, so reserve the taller of the wrapped-line count and that
 * minimum. These fields are now rich text (HTML), so wrapped lines are counted
 * with the same `estimateHtmlLines` helper the summary uses — it strips inline
 * marks and treats block/`<br>` boundaries as line breaks. Text wraps in a narrow
 * entry column, hence `bodyCharsPerLine`.
 */
function multilineMm(m: LayoutMetrics, em: number, html: string): number {
  const lines = Math.max(MULTILINE_ROWS, estimateHtmlLines(html, m.bodyCharsPerLine));
  return lines * m.lineMm(em);
}

export function estimatePersonalInfoHeight(info: PersonalInfo, m: LayoutMetrics): number {
  const { fieldVisibility } = info;

  const identityMm =
    m.lineMm(EM_NAME) +
    (fieldVisibility.jobTitle ? pxToMm(2) + m.lineMm(EM_SUBTITLE) : 0);

  // Contacts and links share a flexible row area that wraps in practice; count
  // wrapped rows generously (≈2 contacts per row, one row per link).
  const contactFields = [
    fieldVisibility.phone,
    fieldVisibility.email,
    fieldVisibility.location,
    fieldVisibility.dateOfBirth,
    fieldVisibility.nationality,
  ].filter(Boolean).length;
  const contactRows = contactFields > 0 ? Math.ceil(contactFields / 2) : 0;
  const linkRows = fieldVisibility.links ? info.links.length : 0;
  const contactsMm = (contactRows + linkRows) * (m.lineMm(EM_BODY) + pxToMm(4));

  const rightColumnMm = identityMm + pxToMm(8) + contactsMm;
  const photoMm = fieldVisibility.photo ? pxToMm(PROFILE_PHOTO_PX) : 0;

  // Bottom padding (pb=3) + 2px accent underline.
  return Math.max(rightColumnMm, photoMm) + pxToMm(12) + pxToMm(2);
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

export function estimateExperienceItemHeight(item: ExperienceItem, m: LayoutMetrics): number {
  const responsibilitiesMm = item.responsibilities.reduce(
    (total, responsibility) => total + multilineMm(m, EM_BODY, responsibility.text) + pxToMm(2),
    0,
  );

  const mainColumnMm =
    2 * m.lineMm(EM_ITEM_TITLE) + // job title + company
    (item.projectLink ? m.lineMm(EM_BODY) : 0) +
    multilineMm(m, EM_BODY, item.projectDescription) + // project description (always rendered)
    responsibilitiesMm +
    // Responsibilities are a keyboard-driven list (Enter adds, Backspace removes),
    // so there is no longer an "add responsibility" button taking vertical space.
    pxToMm(16); // accumulated 0.5-unit field gaps + safety

  // Date column: start + end DateField (each a single-line trigger, same height
  // as the prior text input) + the "now" toggle button + city.
  const dateColumnMm = 3 * m.lineMm(EM_BODY) + pxToMm(CONTROL_BUTTON_PX) + pxToMm(6);

  return Math.max(mainColumnMm, dateColumnMm) + pxToMm(8); // pb=2
}

export function estimateSkillGroupHeight(group: SkillGroup, m: LayoutMetrics): number {
  // The trailing "add skill" button shares the wrap, so reserve one extra slot.
  const chipRows = Math.max(1, Math.ceil((group.skills.length + 1) / SKILL_CHIPS_PER_ROW));
  const chipRowMm = m.lineMm(EM_BODY) + pxToMm(4) + pxToMm(8); // chip padding + wrap gap
  return m.lineMm(EM_ITEM_TITLE) + pxToMm(2) + chipRows * chipRowMm + pxToMm(12); // pb=2 + safety
}

export function estimateEducationItemHeight(item: EducationItem, m: LayoutMetrics): number {
  const mainColumnMm =
    2 * m.lineMm(EM_ITEM_TITLE) + // degree + university
    m.lineMm(EM_BODY) + // gpa row
    multilineMm(m, EM_BODY, item.achievements) + // achievements (always rendered)
    pxToMm(10);

  // Date column mirrors the experience entry: start + end DateField + city.
  const dateColumnMm = 3 * m.lineMm(EM_BODY) + pxToMm(CONTROL_BUTTON_PX) + pxToMm(6);

  return Math.max(mainColumnMm, dateColumnMm) + pxToMm(8); // pb=2
}

export function estimateProjectItemHeight(item: ProjectItem, m: LayoutMetrics): number {
  return (
    m.lineMm(EM_ITEM_TITLE) + // name + role row
    m.lineMm(EM_BODY) + // link
    multilineMm(m, EM_BODY, item.description) + // description (always rendered)
    pxToMm(8) +
    pxToMm(8) // pb=2
  );
}

export function estimateLanguageItemHeight(m: LayoutMetrics): number {
  return m.lineMm(EM_ITEM_TITLE) + pxToMm(8); // single row + pb=1 + safety
}

export function estimateCertificationItemHeight(m: LayoutMetrics): number {
  return m.lineMm(EM_ITEM_TITLE) + m.lineMm(EM_BODY) + pxToMm(8); // name + issuer/date + pb=1.5
}
