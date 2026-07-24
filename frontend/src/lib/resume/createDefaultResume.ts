import { t } from "@/lib/i18n";
import { createId } from "@/lib/utils/id";
import type {
  AchievementItem,
  CertificationItem,
  EducationItem,
  ExperienceItem,
  LanguageItem,
  PersonalInfo,
  ProjectItem,
  RemovableSectionType,
  SectionMeta,
  SkillGroup,
  ResumeData,
  SummaryContent,
  ThemeSettings,
} from "@/types";

const DEFAULT_SECTION_ORDER: RemovableSectionType[] = [
  "summary",
  "experience",
  "skills",
  "education",
  "projects",
  "languages",
  "certifications",
  "achievements",
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

export function createDefaultSections(): SectionMeta[] {
  return DEFAULT_SECTION_ORDER.map((type, index) => ({
    id: createId(),
    type,
    title: sectionTitles[type],
    visible: true,
    direction: "rtl",
    order: index,
    languageMeterVariant: "bars" as const,
    languageShowMeter: true,
    languageShowLevelText: true,
    showMonth: true,
    monthFormat: "name" as const,
    achievementShowDescription: true,
    achievementShowIcons: true,
    skillDisplayMode: "row" as const,
    skillShowLevel: false,
    skillMeterVariant: "line" as const,
  }));
}

export function createDefaultTheme(): ThemeSettings {
  return {
    themeId: "indigo",
    pageBackground: "theme",
    backgroundPattern: "blobs",
    // Soft, readability-safe default: the pattern renders at 70% of its baseline
    // opacity (the «شدت پس‌زمینه» slider lets the user dial it lighter/stronger).
    backgroundIntensity: 0.7,
    dateCalendar: "jalali",
    fontFamily: "vazirmatn",
    fontScale: 1,
    lineHeight: 1.5,
    pageMargin: 16,
    sectionSpacing: 6,
    // 1 = each coloured-column template keeps its original tint (the current look).
    columnIntensity: 1,
    // "medium" = each column template keeps its original side-column width.
    columnWidth: "medium",
    // Off by default so existing résumés look unchanged until the user opts in.
    showSectionIcons: false,
    // Off by default: sections stay separated by spacing/typography alone until
    // the user turns on the thin title separator.
    showSectionSeparators: false,
    // Off by default: the résumé keeps its designed template until the user turns
    // on ATS Friendly mode.
    atsMode: false,
  };
}

export function createDefaultPersonalInfo(): PersonalInfo {
  return {
    fullName: "",
    jobTitle: "",
    phone: "",
    location: "",
    email: "",
    dateOfBirth: "",
    nationality: "",
    militaryService: "",
    links: [],
    profileImage: null,
    uppercaseName: false,
    photoStyle: "round",
    imageSide: "left",
    fieldVisibility: {
      jobTitle: true,
      phone: true,
      links: true,
      email: true,
      location: true,
      photo: true,
      dateOfBirth: false,
      nationality: false,
      militaryService: false,
    },
  };
}

// --- Default seed content -------------------------------------------------
// A brand-new resume ships with EMPTY items only: no sample names, companies,
// dates, skills or prose anywhere — every field relies on its sample-value
// placeholder instead (most sections prefix it with «مثال:»; personal info and
// skills show the bare value), which clears the moment the user types. Only the item
// COUNTS are seeded (4 experiences × 2 bullets, 1 skill, 4 educations,
// 2 achievements) so the editor opens with ready-to-fill entries.

export function createDefaultSummary(): SummaryContent {
  return { html: "" };
}

function createEmptyExperience(): ExperienceItem {
  return {
    id: createId(),
    jobTitle: "",
    companyName: "",
    period: { start: "", end: "", current: false },
    city: "",
    projectLink: "",
    projectDescription: "",
    link: "",
    linkVisible: true,
    responsibilities: [
      { id: createId(), text: "" },
      { id: createId(), text: "" },
    ],
  };
}

export function createDefaultExperience(): ExperienceItem[] {
  return Array.from({ length: 4 }, createEmptyExperience);
}

export function createDefaultSkills(): SkillGroup[] {
  return [
    {
      id: createId(),
      name: "",
      showTitle: true,
      skills: [{ id: createId(), name: "", level: 3 }],
    },
  ];
}

function createEmptyEducation(): EducationItem {
  return {
    id: createId(),
    degree: "",
    university: "",
    startDate: "",
    endDate: "",
    gpa: "",
    achievements: "",
    city: "",
  };
}

export function createDefaultEducation(): EducationItem[] {
  return Array.from({ length: 4 }, createEmptyEducation);
}

export function createDefaultProjects(): ProjectItem[] {
  return [
    {
      id: createId(),
      name: "",
      role: "",
      link: "",
      linkVisible: true,
      description: "",
    },
  ];
}

export function createDefaultLanguages(): LanguageItem[] {
  return [{ id: createId(), name: "", level: 3, showBars: true, showLevelText: true }];
}

export function createDefaultCertifications(): CertificationItem[] {
  return [{ id: createId(), name: "", issuer: "", date: "" }];
}

export function createDefaultAchievements(): AchievementItem[] {
  return [
    { id: createId(), title: "", description: "" },
    { id: createId(), title: "", description: "" },
  ];
}

export function createDefaultResume(): ResumeData {
  const now = new Date().toISOString();

  return {
    id: createId(),
    title: "رزومه من",
    locale: "fa",
    templateId: "professional-single-column",
    theme: createDefaultTheme(),
    sections: createDefaultSections(),
    personalInfo: createDefaultPersonalInfo(),
    summary: createDefaultSummary(),
    experience: createDefaultExperience(),
    skills: createDefaultSkills(),
    education: createDefaultEducation(),
    projects: createDefaultProjects(),
    languages: createDefaultLanguages(),
    certifications: createDefaultCertifications(),
    achievements: createDefaultAchievements(),
    createdAt: now,
    updatedAt: now,
  };
}
