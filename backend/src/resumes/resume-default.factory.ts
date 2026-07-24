import { randomUUID } from 'node:crypto';
import type {
  PersonalInfo,
  RemovableSectionType,
  ResumeData,
  SectionMeta,
  TemplateId,
  ThemeSettings,
} from '@resume/types';

/**
 * Server-side port of the frontend `createDefaultResume` (frontend/src/lib/resume
 * /createDefaultResume.ts): every item ships EMPTY (placeholders carry the
 * guidance), only the item counts are seeded, so a resume created via
 * POST /resumes with no body is identical in shape to one the frontend creates.
 */

const DEFAULT_SECTION_ORDER: RemovableSectionType[] = [
  'summary',
  'experience',
  'skills',
  'education',
  'projects',
  'languages',
  'certifications',
  'achievements',
];

const SECTION_TITLES: Record<RemovableSectionType, string> = {
  summary: 'درباره من',
  experience: 'تجربه کاری',
  skills: 'مهارت‌ها',
  education: 'تحصیلات',
  projects: 'پروژه‌ها',
  languages: 'زبان‌ها',
  certifications: 'گواهینامه‌ها',
  achievements: 'دستاوردهای کلیدی',
};

function createDefaultSections(): SectionMeta[] {
  return DEFAULT_SECTION_ORDER.map((type, index) => ({
    id: randomUUID(),
    type,
    title: SECTION_TITLES[type],
    visible: true,
    direction: 'rtl',
    order: index,
    languageMeterVariant: 'bars' as const,
    languageShowMeter: true,
    languageShowLevelText: true,
    showMonth: true,
    monthFormat: 'name' as const,
    achievementShowDescription: true,
    achievementShowIcons: true,
    skillDisplayMode: 'row' as const,
    skillShowLevel: false,
    skillMeterVariant: 'line' as const,
  }));
}

function createDefaultTheme(): ThemeSettings {
  return {
    themeId: 'indigo',
    pageBackground: 'theme',
    backgroundPattern: 'blobs',
    backgroundIntensity: 0.7,
    dateCalendar: 'jalali',
    fontFamily: 'vazirmatn',
    fontScale: 1,
    lineHeight: 1.5,
    pageMargin: 16,
    sectionSpacing: 6,
    columnIntensity: 1,
    columnWidth: 'medium',
    showSectionIcons: false,
    showSectionSeparators: false,
    atsMode: false,
  };
}

function createDefaultPersonalInfo(): PersonalInfo {
  return {
    fullName: '',
    jobTitle: '',
    phone: '',
    location: '',
    email: '',
    dateOfBirth: '',
    nationality: '',
    militaryService: '',
    links: [],
    profileImage: null,
    uppercaseName: false,
    photoStyle: 'round',
    imageSide: 'left',
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

export interface DefaultResumeOverrides {
  title?: string;
  templateId?: TemplateId;
  locale?: 'fa' | 'en';
  occupationCategory?: string | null;
}

export function createDefaultResumeData(overrides: DefaultResumeOverrides = {}): ResumeData {
  const now = new Date().toISOString();

  return {
    id: randomUUID(),
    title: overrides.title ?? 'رزومه من',
    locale: overrides.locale ?? 'fa',
    templateId: overrides.templateId ?? 'professional-single-column',
    occupationCategory: overrides.occupationCategory ?? null,
    theme: createDefaultTheme(),
    sections: createDefaultSections(),
    personalInfo: createDefaultPersonalInfo(),
    summary: { html: '' },
    // Empty items only — no sample content anywhere; the editor's «مثال: …»
    // placeholders carry the guidance. Only the COUNTS are seeded (4 experiences
    // × 2 bullets, 1 skill, 4 educations, 2 achievements), mirroring the frontend.
    experience: Array.from({ length: 4 }, () => ({
      id: randomUUID(),
      jobTitle: '',
      companyName: '',
      period: { start: '', end: '', current: false },
      city: '',
      projectLink: '',
      projectDescription: '',
      link: '',
      linkVisible: true,
      responsibilities: [
        { id: randomUUID(), text: '' },
        { id: randomUUID(), text: '' },
      ],
    })),
    skills: [
      {
        id: randomUUID(),
        name: '',
        showTitle: true,
        skills: [{ id: randomUUID(), name: '', level: 3 }],
      },
    ],
    education: Array.from({ length: 4 }, () => ({
      id: randomUUID(),
      degree: '',
      university: '',
      startDate: '',
      endDate: '',
      gpa: '',
      achievements: '',
      city: '',
    })),
    projects: [
      {
        id: randomUUID(),
        name: '',
        role: '',
        link: '',
        linkVisible: true,
        description: '',
      },
    ],
    languages: [{ id: randomUUID(), name: '', level: 3, showBars: true, showLevelText: true }],
    certifications: [
      {
        id: randomUUID(),
        name: '',
        issuer: '',
        date: '',
      },
    ],
    achievements: [
      { id: randomUUID(), title: '', description: '' },
      { id: randomUUID(), title: '', description: '' },
    ],
    createdAt: now,
    updatedAt: now,
  };
}
