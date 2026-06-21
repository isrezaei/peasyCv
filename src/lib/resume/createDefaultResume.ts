import { t } from "@/lib/i18n";
import { createId } from "@/lib/utils/id";
import type {
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

export function createDefaultSections(): SectionMeta[] {
  return DEFAULT_SECTION_ORDER.map((type, index) => ({
    id: createId(),
    type,
    title: sectionTitles[type],
    visible: true,
    direction: "rtl",
    order: index,
  }));
}

export function createDefaultTheme(): ThemeSettings {
  return {
    themeId: "indigo",
    customColor: null,
    pageBackground: "theme",
    backgroundPattern: "blobs",
    dateCalendar: "jalali",
    fontFamily: "vazirmatn",
    fontScale: 1,
    lineHeight: 1.5,
    pageMargin: 16,
    sectionSpacing: 6,
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
    links: [],
    profileImage: null,
    uppercaseName: false,
    photoStyle: "round",
    fieldVisibility: {
      jobTitle: true,
      phone: true,
      links: true,
      email: true,
      location: true,
      photo: true,
      dateOfBirth: false,
      nationality: false,
    },
  };
}

// --- Default seed content -------------------------------------------------
// A brand-new resume ships with one illustrative example per section so nothing
// renders empty on first load. The text is intentionally written as guidance
// (prose prefixed with «نمونه») so it reads as example content the user replaces,
// not as their own data. Seeds are real schema-valid data, so persistence,
// normalization and the API contracts are unaffected.

export function createDefaultSummary(): SummaryContent {
  // Ships empty so the «درباره من» editor shows its guidance as a placeholder
  // (t.summary.placeholder) that clears the moment the user types — rather than
  // seeding example prose the user has to delete first.
  return { html: "" };
}

export function createDefaultExperience(): ExperienceItem[] {
  const seed = t.defaults.experience;
  return [
    {
      id: createId(),
      jobTitle: seed.jobTitle,
      companyName: seed.companyName,
      period: { start: seed.periodStart, end: "", current: true },
      city: seed.city,
      projectLink: "",
      projectDescription: seed.projectDescription,
      responsibilities: [
        { id: createId(), text: seed.responsibilityOne },
        { id: createId(), text: seed.responsibilityTwo },
      ],
    },
  ];
}

export function createDefaultSkills(): SkillGroup[] {
  const seed = t.defaults.skills;
  return [
    {
      id: createId(),
      name: seed.groupName,
      skills: seed.items.map((name) => ({ id: createId(), name })),
    },
  ];
}

export function createDefaultEducation(): EducationItem[] {
  const seed = t.defaults.education;
  return [
    {
      id: createId(),
      degree: seed.degree,
      university: seed.university,
      startDate: seed.startDate,
      endDate: seed.endDate,
      gpa: "",
      achievements: seed.achievements,
      city: seed.city,
    },
  ];
}

export function createDefaultProjects(): ProjectItem[] {
  const seed = t.defaults.project;
  return [
    {
      id: createId(),
      name: seed.name,
      role: seed.role,
      link: "",
      description: seed.description,
    },
  ];
}

export function createDefaultLanguages(): LanguageItem[] {
  return t.defaults.languages.map((language) => ({
    id: createId(),
    name: language.name,
    level: language.level,
  }));
}

export function createDefaultCertifications(): CertificationItem[] {
  const seed = t.defaults.certification;
  return [
    {
      id: createId(),
      name: seed.name,
      issuer: seed.issuer,
      date: seed.date,
    },
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
    createdAt: now,
    updatedAt: now,
  };
}
