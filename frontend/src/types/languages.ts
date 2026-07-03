import type { ID } from "./common";

/** Proficiency on a 1–5 dot scale, matching the reference template meters. */
export type LanguageLevel = 1 | 2 | 3 | 4 | 5;

export interface LanguageItem {
  id: ID;
  name: string;
  level: LanguageLevel;
}
