import type {
  BackgroundPatternId,
  PersonalInfo,
  RemovableSectionType,
  ResumeData,
  SectionMeta,
  TemplateId,
  ThemeSettings,
} from "@/types";
import { t } from "@/lib/i18n";
import { createId } from "@/lib/utils/id";
import {
  createDefaultPersonalInfo,
  createDefaultResume,
  createDefaultTheme,
} from "./createDefaultResume";

const VALID_TEMPLATES: TemplateId[] = [
  "professional-single-column",
  "double-column",
  "sidebar-column",
  "aside-dark",
  "aside-photo",
  "timeline-panel",
  "header-band",
  "compact-duo",
  "ruled-single",
  "classic-centered",
];

const sectionTitles: Record<RemovableSectionType, string> = {
  summary: t.sections.summary,
  experience: t.sections.experience,
  skills: t.sections.skills,
  education: t.sections.education,
  projects: t.sections.projects,
  languages: t.sections.languages,
  certifications: t.sections.certifications,
};

// Section titles that previous app versions persisted and that have since been
// renamed. A saved resume keeps its own (truthy) section title, so without this
// the old label would survive forever; we refresh just these known defaults to
// the current dictionary value so a rename lands on existing resumes too.
const RENAMED_SECTION_TITLES: Partial<Record<RemovableSectionType, string[]>> = {
  summary: ["خلاصه"],
};

function resolveSectionTitle(section: SectionMeta): string {
  if (!section.title) return sectionTitles[section.type];
  const renamedFrom = RENAMED_SECTION_TITLES[section.type];
  if (renamedFrom?.includes(section.title)) return sectionTitles[section.type];
  return section.title;
}

const ALL_SECTION_TYPES: RemovableSectionType[] = [
  "summary",
  "experience",
  "skills",
  "education",
  "projects",
  "languages",
  "certifications",
];

const VALID_BACKGROUND_PATTERNS: BackgroundPatternId[] = [
  "none",
  "blobs",
  "botanical",
  "bracketsRings",
  "chevronField",
  "concentricArcs",
  "dotGrid",
  "topoLines",
];

// Patterns retired over successive design refreshes, mapped to their closest
// surviving analog so saved resumes keep a sensible decoration instead of
// silently losing it (presentation-only — never touches content data). The 2026
// refresh additionally dropped the rainbow and zigzag-bands motifs: rainbow has
// no kept analog so it falls back to "blobs", and the chevron bands collapse to
// the surviving "chevronField" (the tiny-zigzag member of the same family).
const RENAMED_BACKGROUND_PATTERNS: Record<string, BackgroundPatternId> = {
  topographic: "topoLines",
  halftone: "dotGrid",
  chevron: "chevronField",
  chevronBands: "chevronField",
  "corner-brackets": "bracketsRings",
  "rainbow-corner": "blobs",
  rainbow: "blobs",
  hexLines: "bracketsRings",
};

function resolveBackgroundPattern(
  value: string | undefined,
  fallback: BackgroundPatternId,
): BackgroundPatternId {
  if (!value) return fallback;
  if (VALID_BACKGROUND_PATTERNS.includes(value as BackgroundPatternId)) {
    return value as BackgroundPatternId;
  }
  return RENAMED_BACKGROUND_PATTERNS[value] ?? fallback;
}

// Keep the persisted multiplier inside the slider's range so an out-of-bounds or
// legacy value can never render the background invisibly faint or readability-
// breaking. Matches the clamp in the theme slice / the slider's min–max.
const BG_INTENSITY_MIN = 0.35;
const BG_INTENSITY_MAX = 1.25;
function normalizeBackgroundIntensity(value: number | undefined, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.min(BG_INTENSITY_MAX, Math.max(BG_INTENSITY_MIN, value));
}

// Coloured-column intensity multiplier. Kept inside the slider's range so a legacy
// or out-of-bounds value can never render the column unreadably faint or harsh.
const COLUMN_INTENSITY_MIN = 0.5;
const COLUMN_INTENSITY_MAX = 1.5;
function normalizeColumnIntensity(value: number | undefined, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.min(COLUMN_INTENSITY_MAX, Math.max(COLUMN_INTENSITY_MIN, value));
}

function normalizeTheme(theme: Partial<ThemeSettings> | undefined): ThemeSettings {
  const defaults = createDefaultTheme();
  if (!theme) return defaults;
  return {
    themeId: theme.themeId ?? defaults.themeId,
    pageBackground: theme.pageBackground ?? defaults.pageBackground,
    backgroundPattern: resolveBackgroundPattern(theme.backgroundPattern, defaults.backgroundPattern),
    backgroundIntensity: normalizeBackgroundIntensity(
      theme.backgroundIntensity,
      defaults.backgroundIntensity,
    ),
    dateCalendar: theme.dateCalendar ?? defaults.dateCalendar,
    fontFamily: theme.fontFamily ?? defaults.fontFamily,
    fontScale: theme.fontScale ?? defaults.fontScale,
    lineHeight: theme.lineHeight ?? defaults.lineHeight,
    pageMargin: theme.pageMargin ?? defaults.pageMargin,
    sectionSpacing: theme.sectionSpacing ?? defaults.sectionSpacing,
    columnIntensity: normalizeColumnIntensity(theme.columnIntensity, defaults.columnIntensity),
  };
}

function normalizePersonalInfo(info: Partial<PersonalInfo> | undefined): PersonalInfo {
  const defaults = createDefaultPersonalInfo();
  if (!info) return defaults;
  return {
    fullName: info.fullName ?? "",
    jobTitle: info.jobTitle ?? "",
    phone: info.phone ?? "",
    location: info.location ?? "",
    email: info.email ?? "",
    dateOfBirth: info.dateOfBirth ?? "",
    nationality: info.nationality ?? "",
    links: info.links ?? [],
    profileImage: info.profileImage ?? null,
    uppercaseName: info.uppercaseName ?? false,
    photoStyle: info.photoStyle ?? "round",
    fieldVisibility: { ...defaults.fieldVisibility, ...(info.fieldVisibility ?? {}) },
  };
}

function normalizeSections(sections: SectionMeta[] | undefined): SectionMeta[] {
  const existing = Array.isArray(sections) ? [...sections] : [];
  const presentTypes = new Set(existing.map((section) => section.type));

  // Append any section type introduced after this resume was saved.
  ALL_SECTION_TYPES.forEach((type) => {
    if (!presentTypes.has(type)) {
      existing.push({
        id: createId(),
        type,
        title: sectionTitles[type],
        visible: type === "projects" || type === "languages" || type === "certifications" ? false : true,
        direction: "rtl",
        order: existing.length,
      });
    }
  });

  return existing
    .map((section, index) => ({
      ...section,
      title: resolveSectionTitle(section),
      order: typeof section.order === "number" ? section.order : index,
    }))
    .sort((a, b) => a.order - b.order)
    .map((section, index) => ({ ...section, order: index }));
}

/**
 * Backfills any fields, sections, or collections added since a resume was
 * persisted, so older localStorage payloads load without runtime errors and
 * never silently drop user data.
 */
export function normalizeResume(raw: Partial<ResumeData> | null | undefined): ResumeData {
  const defaults = createDefaultResume();
  if (!raw) return defaults;

  const templateId =
    raw.templateId && VALID_TEMPLATES.includes(raw.templateId)
      ? raw.templateId
      : defaults.templateId;

  return {
    id: raw.id ?? defaults.id,
    title: raw.title ?? defaults.title,
    locale: raw.locale ?? "fa",
    templateId,
    theme: normalizeTheme(raw.theme),
    sections: normalizeSections(raw.sections),
    personalInfo: normalizePersonalInfo(raw.personalInfo),
    summary: raw.summary ?? { html: "" },
    experience: raw.experience ?? [],
    skills: raw.skills ?? [],
    education: raw.education ?? [],
    projects: raw.projects ?? [],
    languages: raw.languages ?? [],
    certifications: raw.certifications ?? [],
    createdAt: raw.createdAt ?? defaults.createdAt,
    updatedAt: raw.updatedAt ?? defaults.updatedAt,
  };
}
