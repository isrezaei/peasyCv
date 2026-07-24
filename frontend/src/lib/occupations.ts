/**
 * Single source of truth for the signup occupation list (UI + admin labels).
 * The ids MUST stay in lockstep with the backend's OCCUPATION_IDS (validated
 * there with @IsIn); the Persian labels live only here. A fixed list — not free
 * text — keeps the admin aggregation clean and translatable. "other" is the
 * catch-all; a null occupation (Google signups, pre-existing users) is reported
 * separately as UNSPECIFIED.
 */
export interface Occupation {
  id: string;
  label: string;
}

export const OCCUPATIONS: readonly Occupation[] = [
  { id: "software-engineering", label: "مهندسی نرم‌افزار / برنامه‌نویسی" },
  { id: "data-science", label: "علم داده و هوش مصنوعی" },
  { id: "design", label: "طراحی (رابط کاربری، گرافیک)" },
  { id: "product-management", label: "مدیریت محصول" },
  { id: "marketing", label: "بازاریابی و تبلیغات" },
  { id: "sales", label: "فروش" },
  { id: "accounting-finance", label: "حسابداری و امور مالی" },
  { id: "management", label: "مدیریت" },
  { id: "civil-engineering", label: "مهندسی عمران" },
  { id: "mechanical-engineering", label: "مهندسی مکانیک" },
  { id: "electrical-engineering", label: "مهندسی برق" },
  { id: "medicine-health", label: "پزشکی و سلامت" },
  { id: "education-teaching", label: "آموزش و تدریس" },
  { id: "law", label: "حقوق" },
  { id: "content-writing", label: "تولید محتوا و نویسندگی" },
  { id: "customer-support", label: "پشتیبانی مشتریان" },
  { id: "human-resources", label: "منابع انسانی" },
  { id: "student", label: "دانشجو" },
  { id: "other", label: "سایر" },
] as const;

/** Sentinel the admin occupation aggregate uses for a null occupation. */
export const UNSPECIFIED_OCCUPATION = "unspecified";

const LABELS = new Map(OCCUPATIONS.map((o) => [o.id, o.label]));

/** Persian label for an occupation id; the raw id (or «نامشخص») as a fallback. */
export function occupationLabel(id: string): string {
  if (id === UNSPECIFIED_OCCUPATION) return "نامشخص";
  return LABELS.get(id) ?? id;
}
