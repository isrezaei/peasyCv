import type { Direction, ID } from "./common";
import type { LanguageMeterVariant } from "./languages";

export type RemovableSectionType =
  | "summary"
  | "experience"
  | "skills"
  | "education"
  | "projects"
  | "languages"
  | "certifications"
  | "achievements";

export type SectionType = "personalInfo" | RemovableSectionType;

/**
 * How a period date's month renders: the localized month name («فروردین») or its
 * ordinal («12»). The label is always DERIVED from the stored ISO date — never
 * stored — like the languages level word.
 */
export type MonthFormat = "name" | "number";

/** Allowed stored values, shared by normalization and the settings UI. */
export const MONTH_FORMATS: MonthFormat[] = ["name", "number"];

export interface SectionMeta {
  id: ID;
  type: RemovableSectionType;
  title: string;
  visible: boolean;
  direction: Direction;
  order: number;
  /** Languages-section display settings — section-wide, meaningful only for
   *  type "languages" but present (defaulted) on every section like `direction`. */
  languageMeterVariant: LanguageMeterVariant;
  languageShowMeter: boolean;
  languageShowLevelText: boolean;
  /** Period-date display settings — section-wide, meaningful for the dated
   *  sections ("experience", "education") but present (defaulted) on every
   *  section like the languages settings. Each section row keeps its own pair,
   *  so Experience and Education are configured independently. */
  showMonth: boolean;
  monthFormat: MonthFormat;
  /** Achievements-section display settings — section-wide, meaningful only for
   *  type "achievements" but present (defaulted) on every section like the
   *  languages settings. The item TITLE is always rendered (no toggle). */
  achievementShowDescription: boolean;
  achievementShowIcons: boolean;
}
