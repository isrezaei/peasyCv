/**
 * Single source of truth for the occupation CATEGORIES that drive the resume's
 * category-tailored default (example/placeholder) content.
 *
 * Distinct from `lib/occupations.ts` (the granular signup-analytics list):
 * these are 10 broad Iran-focused job-market families — chosen from the
 * Jobinja category taxonomy and the Jobvision 1404 job-market reports — plus
 * «آزاد» (`azad`), the generic fallback used when nothing fits or the choice
 * is skipped.
 *
 * Only the id is ever persisted (guest localStorage / User.occupationCategory);
 * Persian labels live in the i18n dictionary (`t.occupations.labels`), and the
 * per-category placeholder content lives in `lib/occupationDefaults.ts` —
 * adding a category later is data-only: append an id here, a label there, and
 * a placeholder set in the defaults map. The backend mirror is
 * `backend/src/auth/occupation-category.constants.ts` (validated with @IsIn).
 */
export const OCCUPATION_CATEGORY_IDS = [
  "software-it",
  "sales-marketing",
  "finance-accounting",
  "admin-hr",
  "design-creative",
  "content-media",
  "engineering-technical",
  "health-medical",
  "education-training",
  "customer-support",
  "azad",
] as const;

export type OccupationCategoryId = (typeof OCCUPATION_CATEGORY_IDS)[number];

/** Fallback for skippers, unknown ids and anyone who never chose. */
export const DEFAULT_OCCUPATION_CATEGORY: OccupationCategoryId = "azad";

export function isOccupationCategoryId(value: unknown): value is OccupationCategoryId {
  return (
    typeof value === "string" && (OCCUPATION_CATEGORY_IDS as readonly string[]).includes(value)
  );
}

// --- Guest persistence ------------------------------------------------------
// The guest's choice lives in localStorage (there is no account row to hold
// it). `explicit` distinguishes a real choice from a skip: an explicit choice
// is carried into the account on login (OccupationGate PATCHes it when the
// server category is still null); a skip only silences the GUEST prompt — a
// later login still asks once, as specified.

const GUEST_CATEGORY_KEY = "ai-res:occupation-category";

export interface GuestCategoryChoice {
  id: OccupationCategoryId;
  explicit: boolean;
}

export function loadGuestCategoryChoice(): GuestCategoryChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(GUEST_CATEGORY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GuestCategoryChoice>;
    if (!isOccupationCategoryId(parsed.id)) return null;
    return { id: parsed.id, explicit: parsed.explicit === true };
  } catch {
    return null;
  }
}

export function saveGuestCategoryChoice(choice: GuestCategoryChoice): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GUEST_CATEGORY_KEY, JSON.stringify(choice));
  } catch {
    // Private mode / quota: the prompt may re-show next visit, nothing worse.
  }
}

// --- Active category (module store) ----------------------------------------
// The i18n placeholder getters (lib/i18n/fa.ts) resolve against this value
// synchronously at render time, so the 22 files that read `t.*Placeholder`
// (templates included) stay byte-identical. Deliberately framework-free (this
// module is reachable from server components via the i18n dictionary): React
// surfaces subscribe through useSyncExternalStore in their own "use client"
// modules (see OccupationGate), and the editor subtree is remounted with
// `key={category}`, which re-reads every placeholder.

let activeCategory: OccupationCategoryId = DEFAULT_OCCUPATION_CATEGORY;
const listeners = new Set<() => void>();

export function getActiveOccupationCategory(): OccupationCategoryId {
  return activeCategory;
}

export function setActiveOccupationCategory(id: OccupationCategoryId): void {
  if (id === activeCategory) return;
  activeCategory = id;
  listeners.forEach((listener) => listener());
}

export function subscribeOccupationCategory(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
