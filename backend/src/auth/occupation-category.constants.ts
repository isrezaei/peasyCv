/**
 * Fixed occupation-CATEGORY list driving the resume's category-tailored default
 * (example/placeholder) content. Distinct from OCCUPATION_IDS (the granular
 * signup-analytics list): these are ~10 broad Iran-focused job-market families
 * plus "azad" (آزاد — free/other), the generic fallback for skippers.
 *
 * The ids MUST stay in lockstep with the frontend's single source of truth
 * (frontend/src/lib/occupationCategories.ts); Persian labels live only there
 * (i18n) — only the id is ever persisted.
 *
 * SECURITY: occupationCategory is user-writable, so every DTO that accepts it
 * validates against this exact set with @IsIn — arbitrary strings are rejected.
 */
export const OCCUPATION_CATEGORY_IDS = [
  'software-it',
  'sales-marketing',
  'finance-accounting',
  'admin-hr',
  'design-creative',
  'content-media',
  'engineering-technical',
  'health-medical',
  'education-training',
  'customer-support',
  'azad',
] as const;

export type OccupationCategoryId = (typeof OCCUPATION_CATEGORY_IDS)[number];
