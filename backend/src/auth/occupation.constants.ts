/**
 * Fixed occupation list offered at email/password signup. A closed list (not
 * free text) keeps the admin aggregation clean and translatable — the Persian
 * labels live frontend-side (lib/occupations.ts) keyed by these ids. "other" is
 * the catch-all; a null occupation (Google signups, pre-existing users) is
 * reported separately as "unspecified".
 *
 * SECURITY: occupation is user-writable, so the register DTO validates against
 * this exact set with @IsIn — arbitrary strings are rejected.
 */
export const OCCUPATION_IDS = [
  'software-engineering',
  'data-science',
  'design',
  'product-management',
  'marketing',
  'sales',
  'accounting-finance',
  'management',
  'civil-engineering',
  'mechanical-engineering',
  'electrical-engineering',
  'medicine-health',
  'education-teaching',
  'law',
  'content-writing',
  'customer-support',
  'human-resources',
  'student',
  'other',
] as const;

export type OccupationId = (typeof OCCUPATION_IDS)[number];
