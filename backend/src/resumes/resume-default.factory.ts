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
 * /createDefaultResume.ts), including the Persian seed content from the fa.ts
 * dictionary, so a resume created via POST /resumes with no body is identical in
 * shape and spirit to one the frontend would create. Dates are canonical ISO.
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
    showSectionIcons: false,
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
    },
  };
}

export interface DefaultResumeOverrides {
  title?: string;
  templateId?: TemplateId;
  locale?: 'fa' | 'en';
}

export function createDefaultResumeData(overrides: DefaultResumeOverrides = {}): ResumeData {
  const now = new Date().toISOString();

  return {
    id: randomUUID(),
    title: overrides.title ?? 'رزومه من',
    locale: overrides.locale ?? 'fa',
    templateId: overrides.templateId ?? 'professional-single-column',
    theme: createDefaultTheme(),
    sections: createDefaultSections(),
    personalInfo: createDefaultPersonalInfo(),
    summary: { html: '' },
    experience: [
      {
        id: randomUUID(),
        jobTitle: 'نمونه: مهندس نرم‌افزار ارشد',
        companyName: 'شرکت فناوری نمونه',
        period: { start: '2021-06-01', end: '', current: true },
        city: 'تهران',
        projectLink: '',
        projectDescription:
          'نمونه: توضیح کوتاهی دربارهٔ نقش و حوزهٔ کاری خود در این موقعیت بنویسید.',
        link: '',
        linkVisible: true,
        responsibilities: [
          {
            id: randomUUID(),
            text:
              'نمونه: یک دستاورد کلیدی را همراه با عدد و نتیجه بیان کنید (مثلاً «زمان بارگذاری صفحات را ۴۰٪ کاهش دادم»).',
          },
          { id: randomUUID(), text: 'نمونه: مهم‌ترین مسئولیت خود را در این نقش توضیح دهید.' },
        ],
      },
    ],
    skills: [
      {
        id: randomUUID(),
        name: 'مهارت‌های فنی',
        skills: ['React', 'TypeScript', 'Node.js', 'طراحی واسط کاربری'].map((name) => ({
          id: randomUUID(),
          name,
        })),
      },
    ],
    education: [
      {
        id: randomUUID(),
        degree: 'کارشناسی مهندسی کامپیوتر',
        university: 'دانشگاه نمونه',
        startDate: '2017-09-01',
        endDate: '2021-06-01',
        gpa: '',
        achievements: 'نمونه: افتخارات و دستاوردهای تحصیلی خود را اینجا بنویسید.',
        city: 'تهران',
      },
    ],
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
    languages: [
      { id: randomUUID(), name: 'فارسی', level: 5, showBars: true, showLevelText: true },
      { id: randomUUID(), name: 'انگلیسی', level: 4, showBars: true, showLevelText: true },
    ],
    certifications: [
      {
        id: randomUUID(),
        name: 'نمونه: نام گواهینامه',
        issuer: 'مؤسسهٔ صادرکننده',
        date: '2022-05-01',
      },
    ],
    achievements: [
      {
        id: randomUUID(),
        title: 'نمونه: عنوان یک دستاورد کلیدی',
        description: 'نمونه: نتیجه و اثر این دستاورد را در یک یا دو جمله توضیح دهید.',
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}
