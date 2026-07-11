import type { ID } from "./common";

/** Proficiency on a 1–5 dot scale, matching the reference template meters. */
export type LanguageLevel = 1 | 2 | 3 | 4 | 5;

/**
 * Which shape the Languages level meter renders with. Nominal (no order, no
 * arithmetic), so it is stored as a string enum like `direction` and the
 * theme/template ids — never an int ordinal like `LanguageLevel`.
 */
export type LanguageMeterVariant = "bars" | "dots" | "pill" | "line";

/** All meter variants, in menu order. */
export const LANGUAGE_METER_VARIANTS: LanguageMeterVariant[] = ["bars", "dots", "pill", "line"];

export interface LanguageItem {
  id: ID;
  name: string;
  level: LanguageLevel;
  /** Whether the 5-bar level meter renders. Independent of the level word. */
  showBars: boolean;
  /** Whether the level word (derived from `level`, never stored) renders. */
  showLevelText: boolean;
}
