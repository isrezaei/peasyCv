import type {
  BackgroundPatternId,
  ColumnWidthId,
  PersonalInfo,
  RemovableSectionType,
  ResumeData,
  SectionMeta,
  TemplateId,
  ThemeId,
  ThemeSettings,
} from "@/types";
import { isThemeId } from "@/lib/themes";
import { isOccupationCategoryId } from "@/lib/occupationCategories";
import { t } from "@/lib/i18n";
import { LANGUAGE_METER_VARIANTS } from "@/types/languages";
import { MONTH_FORMATS } from "@/types/sections";
import { SKILL_DISPLAY_MODES, SKILL_METER_VARIANTS } from "@/types/skills";
import { createId } from "@/lib/utils/id";
import { sanitizeProjectUrl } from "./sanitizeUrl";
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
  achievements: t.sections.achievements,
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
  "achievements",
];

const VALID_COLUMN_WIDTHS: ColumnWidthId[] = ["small", "medium", "large", "xlarge"];

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
// legacy value can never render the background readability-breaking. Matches the
// clamp in the theme slice / the slider's min–max. The light/faint end was widened
// (0.35 → 0.10) so the user has far more room to go subtle; the strong end is
// unchanged and the default (0.7) stays readability-safe.
const BG_INTENSITY_MIN = 0.1;
const BG_INTENSITY_MAX = 1.25;
function normalizeBackgroundIntensity(value: number | undefined, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.min(BG_INTENSITY_MAX, Math.max(BG_INTENSITY_MIN, value));
}

// Coloured-column intensity multiplier. Kept inside the slider's range so a legacy
// or out-of-bounds value can never render the column unreadably faint or harsh.
const COLUMN_INTENSITY_MIN = 0.5;
const COLUMN_INTENSITY_MAX = 2;
function normalizeColumnIntensity(value: number | undefined, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.min(COLUMN_INTENSITY_MAX, Math.max(COLUMN_INTENSITY_MIN, value));
}

// Theme ids retired by a rename, mapped to their surviving successor — same
// contract as RENAMED_BACKGROUND_PATTERNS above, so a saved resume keeps its
// chosen palette across a rename instead of snapping back to the default.
// Currently empty: git history shows every ThemeId was only ever added; the map
// exists so the next rename has a place to land.
const RENAMED_THEMES: Record<string, ThemeId> = {};

function resolveThemeId(value: string | undefined, fallback: ThemeId): ThemeId {
  if (!value) return fallback;
  if (isThemeId(value)) return value;
  return RENAMED_THEMES[value] ?? fallback;
}

function normalizeTheme(theme: Partial<ThemeSettings> | undefined): ThemeSettings {
  const defaults = createDefaultTheme();
  if (!theme) return defaults;
  return {
    // Allowlisted like templateId/backgroundPattern: an unknown (retired or
    // corrupted) id would make getThemePreset return undefined and hard-crash
    // resolveTheme on `.accentDark` — white screen in the editor, an endless
    // hang on /print.
    themeId: resolveThemeId(theme.themeId, defaults.themeId),
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
    // The column-width preset arrived after resumes were first persisted —
    // backfill it (default "medium", today's original widths) so an old payload
    // hydrates complete, looks identical, and the strict DTO can't 400.
    columnWidth: VALID_COLUMN_WIDTHS.includes(theme.columnWidth as ColumnWidthId)
      ? (theme.columnWidth as ColumnWidthId)
      : defaults.columnWidth,
    // The resume-wide section-icon toggle arrived after resumes were first
    // persisted — backfill it (default OFF) so an old payload hydrates complete
    // and the strict ThemeSettingsDto can't 400 on the next save.
    showSectionIcons:
      typeof theme.showSectionIcons === "boolean"
        ? theme.showSectionIcons
        : defaults.showSectionIcons,
    // The section-separator toggle arrived after resumes were first persisted —
    // backfill it (default OFF) so an old payload hydrates complete and the
    // strict ThemeSettingsDto can't 400 on the next save.
    showSectionSeparators:
      typeof theme.showSectionSeparators === "boolean"
        ? theme.showSectionSeparators
        : defaults.showSectionSeparators,
    // ATS Friendly mode arrived after resumes were first persisted — backfill it
    // (default false) so an old payload hydrates complete, looks identical, and
    // the strict DTO can't 400.
    atsMode: typeof theme.atsMode === "boolean" ? theme.atsMode : defaults.atsMode,
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
    militaryService: info.militaryService ?? "",
    links: info.links ?? [],
    profileImage: info.profileImage ?? null,
    uppercaseName: info.uppercaseName ?? false,
    photoStyle: info.photoStyle ?? "round",
    // The photo left/right option arrived after resumes were first persisted —
    // backfill it (default "left") so an old payload stays valid and the strict
    // PersonalInfoDto can't 400 on the next save.
    imageSide: info.imageSide === "right" ? "right" : "left",
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
        visible:
          type === "projects" ||
          type === "languages" ||
          type === "certifications" ||
          type === "achievements"
            ? false
            : true,
        direction: "rtl",
        order: existing.length,
        languageMeterVariant: "bars",
        languageShowMeter: true,
        languageShowLevelText: true,
        showMonth: true,
        monthFormat: "name",
        achievementShowDescription: true,
        achievementShowIcons: true,
        skillDisplayMode: "row",
        skillShowLevel: false,
        skillMeterVariant: "line",
      });
    }
  });

  return existing
    .map((section, index) => ({
      ...section,
      title: resolveSectionTitle(section),
      order: typeof section.order === "number" ? section.order : index,
      // Section-wide Languages display settings arrived after resumes were first
      // persisted — backfill them so old payloads hydrate complete and the strict
      // SectionMetaDto can't 400 on the next save.
      languageMeterVariant: LANGUAGE_METER_VARIANTS.includes(section.languageMeterVariant)
        ? section.languageMeterVariant
        : "bars",
      languageShowMeter:
        typeof section.languageShowMeter === "boolean" ? section.languageShowMeter : true,
      languageShowLevelText:
        typeof section.languageShowLevelText === "boolean" ? section.languageShowLevelText : true,
      // Period-date display settings arrived after the language ones — same
      // backfill so the strict SectionMetaDto can't 400 an old payload.
      showMonth: typeof section.showMonth === "boolean" ? section.showMonth : true,
      monthFormat: MONTH_FORMATS.includes(section.monthFormat) ? section.monthFormat : "name",
      // Achievements display settings arrived after the period-date ones — same
      // backfill (both default ON) so the strict SectionMetaDto can't 400.
      achievementShowDescription:
        typeof section.achievementShowDescription === "boolean"
          ? section.achievementShowDescription
          : true,
      achievementShowIcons:
        typeof section.achievementShowIcons === "boolean" ? section.achievementShowIcons : true,
      // Skills display settings arrived after the achievements ones — same
      // backfill (tag row, no level meter) so the strict SectionMetaDto can't 400.
      skillDisplayMode: SKILL_DISPLAY_MODES.includes(section.skillDisplayMode)
        ? section.skillDisplayMode
        : "row",
      skillShowLevel: typeof section.skillShowLevel === "boolean" ? section.skillShowLevel : false,
      skillMeterVariant: SKILL_METER_VARIANTS.includes(section.skillMeterVariant)
        ? section.skillMeterVariant
        : "line",
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
    // The per-resume occupation category arrived after resumes were first
    // persisted — backfill unknown/missing values to null (renders the «آزاد»
    // fallback) so old payloads hydrate valid and the strict @IsIn can't 400.
    occupationCategory: isOccupationCategoryId(raw.occupationCategory)
      ? raw.occupationCategory
      : null,
    theme: normalizeTheme(raw.theme),
    sections: normalizeSections(raw.sections),
    personalInfo: normalizePersonalInfo(raw.personalInfo),
    summary: raw.summary ?? { html: "" },
    // Same DTO boundary as `projects` below, for the Experience link pair that
    // mirrors it: `link` must be '' or a valid http(s) URL and `linkVisible` a
    // real boolean, so a payload persisted before the fields existed can't 400
    // the next save.
    experience: (raw.experience ?? []).map((exp) => ({
      ...exp,
      link: typeof exp.link === "string" ? sanitizeProjectUrl(exp.link) : "",
      linkVisible: typeof exp.linkVisible === "boolean" ? exp.linkVisible : true,
    })),
    // Same boundary for the skills display fields (payloads persisted before the
    // fields existed lack them; group titles were always shown and no level was
    // stored) so the strict DTO cannot 400 an old resume on save.
    skills: (raw.skills ?? []).map((group) => ({
      ...group,
      showTitle: typeof group.showTitle === "boolean" ? group.showTitle : true,
      skills: (group.skills ?? []).map((skill) => ({
        ...skill,
        level: typeof skill.level === "number" ? skill.level : 3,
      })),
    })),
    education: raw.education ?? [],
    // The single boundary enforcing ProjectItemDto's contract on hydrated data,
    // for BOTH strictly-validated project fields: `linkVisible` must be a real
    // boolean (payloads persisted before the field existed lack it; links were
    // always shown before the option), and `link` must be '' or a valid http(s)
    // URL (a legacy `github.com/foo` was legal under the old @IsString() and
    // would now 400 the next save). Every hydration surface funnels through
    // here, so nothing the store holds can fail the DTO.
    projects: (raw.projects ?? []).map((project) => ({
      ...project,
      link: typeof project.link === "string" ? sanitizeProjectUrl(project.link) : "",
      linkVisible: typeof project.linkVisible === "boolean" ? project.linkVisible : true,
    })),
    // Same boundary for the language display flags (payloads persisted before
    // the fields existed lack them; bars and the level word were always shown)
    // plus a defensive level, so a strict DTO cannot 400 an old resume on save.
    languages: (raw.languages ?? []).map((language) => ({
      ...language,
      level: typeof language.level === "number" ? language.level : 3,
      showBars: typeof language.showBars === "boolean" ? language.showBars : true,
      showLevelText: typeof language.showLevelText === "boolean" ? language.showLevelText : true,
    })),
    certifications: raw.certifications ?? [],
    // Payloads persisted before the Key-Achievements section existed lack the
    // collection entirely — backfill it empty so hydration stays valid and the
    // next save can't 400 on a missing array.
    achievements: raw.achievements ?? [],
    createdAt: raw.createdAt ?? defaults.createdAt,
    updatedAt: raw.updatedAt ?? defaults.updatedAt,
  };
}
