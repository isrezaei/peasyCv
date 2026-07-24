import type { ID } from "./common";
import type { LanguageLevel, LanguageMeterVariant } from "./languages";

export interface SkillItem {
  id: ID;
  name: string;
  /** Proficiency on the shared 1–5 scale; rendered only when the section-wide
   *  `skillShowLevel` toggle is on, but always stored (like the language level). */
  level: LanguageLevel;
}

export interface SkillGroup {
  id: ID;
  name: string;
  /** Whether this group's title row renders — per group, not section-wide. */
  showTitle: boolean;
  skills: SkillItem[];
}

/** How a skills group lays its items out: a wrapping tag row or a bullet list. */
export type SkillDisplayMode = "row" | "list";

/** Allowed stored values, shared by normalization and the settings UI. */
export const SKILL_DISPLAY_MODES: SkillDisplayMode[] = ["row", "list"];

/** The skill-level meter reuses the Languages meter shapes, minus the pill. */
export type SkillMeterVariant = Exclude<LanguageMeterVariant, "pill">;

/** All skill meter variants, in menu order (the pill is deliberately absent). */
export const SKILL_METER_VARIANTS: SkillMeterVariant[] = ["bars", "dots", "line"];
