import { Prisma } from '@prisma/client';
import type {
  ImageMeta,
  LanguageLevel,
  LanguageMeterVariant,
  MonthFormat,
  PersonalInfo,
  ResumeData,
  ThemeSettings,
} from '@resume/types';

/**
 * Canonical include used for every resume read. Children are ordered so the
 * serialized arrays match the order the frontend store maintains.
 */
export const resumeInclude = {
  theme: true,
  personalInfo: true,
  links: { orderBy: { position: 'asc' } },
  sections: { orderBy: { order: 'asc' } },
  experiences: {
    orderBy: { position: 'asc' },
    include: { responsibilities: { orderBy: { position: 'asc' } } },
  },
  skillGroups: {
    orderBy: { position: 'asc' },
    include: { skills: { orderBy: { position: 'asc' } } },
  },
  educations: { orderBy: { position: 'asc' } },
  projects: { orderBy: { position: 'asc' } },
  languages: { orderBy: { position: 'asc' } },
  certifications: { orderBy: { position: 'asc' } },
} satisfies Prisma.ResumeInclude;

export type ResumeWithRelations = Prisma.ResumeGetPayload<{ include: typeof resumeInclude }>;

// ---------------------------------------------------------------------------
// READ: DB row -> ResumeData (exact frontend shape)
// ---------------------------------------------------------------------------

export function serializeResume(row: ResumeWithRelations): ResumeData {
  if (!row.theme || !row.personalInfo) {
    // Both 1:1 rows are always written on create; their absence means corruption.
    throw new Error(`Resume ${row.id} is missing its theme/personalInfo row.`);
  }

  return {
    id: row.id,
    title: row.title,
    locale: row.locale as 'fa' | 'en',
    templateId: row.templateId as ResumeData['templateId'],
    theme: serializeTheme(row.theme),
    sections: row.sections.map((s) => ({
      id: s.id,
      type: s.type as ResumeData['sections'][number]['type'],
      title: s.title,
      visible: s.visible,
      direction: s.direction as 'rtl' | 'ltr',
      order: s.order,
      languageMeterVariant: s.languageMeterVariant as LanguageMeterVariant,
      languageShowMeter: s.languageShowMeter,
      languageShowLevelText: s.languageShowLevelText,
      showMonth: s.showMonth,
      monthFormat: s.monthFormat as MonthFormat,
    })),
    personalInfo: serializePersonalInfo(row.personalInfo, row.links),
    summary: { html: row.summaryHtml },
    experience: row.experiences.map((e) => ({
      id: e.id,
      jobTitle: e.jobTitle,
      companyName: e.companyName,
      period: { start: e.periodStart, end: e.periodEnd, current: e.periodCurrent },
      city: e.city,
      projectLink: e.projectLink,
      projectDescription: e.projectDescription,
      link: e.link,
      linkVisible: e.linkVisible,
      responsibilities: e.responsibilities.map((r) => ({ id: r.id, text: r.text })),
    })),
    skills: row.skillGroups.map((g) => ({
      id: g.id,
      name: g.name,
      skills: g.skills.map((sk) => ({ id: sk.id, name: sk.name })),
    })),
    education: row.educations.map((ed) => ({
      id: ed.id,
      degree: ed.degree,
      university: ed.university,
      startDate: ed.startDate,
      endDate: ed.endDate,
      gpa: ed.gpa,
      achievements: ed.achievements,
      city: ed.city,
    })),
    projects: row.projects.map((p) => ({
      id: p.id,
      name: p.name,
      role: p.role,
      link: p.link,
      linkVisible: p.linkVisible,
      description: p.description,
    })),
    languages: row.languages.map((l) => ({
      id: l.id,
      name: l.name,
      level: l.level as LanguageLevel,
      showBars: l.showBars,
      showLevelText: l.showLevelText,
    })),
    certifications: row.certifications.map((c) => ({
      id: c.id,
      name: c.name,
      issuer: c.issuer,
      date: c.date,
    })),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function serializeTheme(theme: NonNullable<ResumeWithRelations['theme']>): ThemeSettings {
  return {
    themeId: theme.themeId as ThemeSettings['themeId'],
    pageBackground: theme.pageBackground as ThemeSettings['pageBackground'],
    backgroundPattern: theme.backgroundPattern as ThemeSettings['backgroundPattern'],
    backgroundIntensity: theme.backgroundIntensity,
    dateCalendar: theme.dateCalendar as ThemeSettings['dateCalendar'],
    fontFamily: theme.fontFamily as ThemeSettings['fontFamily'],
    fontScale: theme.fontScale,
    lineHeight: theme.lineHeight,
    pageMargin: theme.pageMargin,
    sectionSpacing: theme.sectionSpacing,
    columnIntensity: theme.columnIntensity,
  };
}

function serializePersonalInfo(
  pi: NonNullable<ResumeWithRelations['personalInfo']>,
  links: ResumeWithRelations['links'],
): PersonalInfo {
  return {
    fullName: pi.fullName,
    jobTitle: pi.jobTitle,
    phone: pi.phone,
    location: pi.location,
    email: pi.email,
    dateOfBirth: pi.dateOfBirth,
    nationality: pi.nationality,
    links: links.map((l) => ({ id: l.id, label: l.label, url: l.url })),
    profileImage: serializeProfileImage(pi),
    uppercaseName: pi.uppercaseName,
    photoStyle: pi.photoStyle as PersonalInfo['photoStyle'],
    fieldVisibility: {
      jobTitle: pi.fvJobTitle,
      phone: pi.fvPhone,
      links: pi.fvLinks,
      email: pi.fvEmail,
      location: pi.fvLocation,
      photo: pi.fvPhoto,
      dateOfBirth: pi.fvDateOfBirth,
      nationality: pi.fvNationality,
    },
  };
}

function serializeProfileImage(
  pi: NonNullable<ResumeWithRelations['personalInfo']>,
): ImageMeta | null {
  if (pi.photoMetaId === null) return null;
  const hasCrop = pi.photoCropZoom !== null;
  return {
    id: pi.photoMetaId,
    url: pi.photoUrl ?? '',
    originalUrl: pi.photoOriginalUrl ?? '',
    width: pi.photoWidth ?? 0,
    height: pi.photoHeight ?? 0,
    crop: hasCrop
      ? {
          x: pi.photoCropX ?? 0,
          y: pi.photoCropY ?? 0,
          width: pi.photoCropWidth ?? 0,
          height: pi.photoCropHeight ?? 0,
          zoom: pi.photoCropZoom ?? 1,
        }
      : null,
  };
}

// ---------------------------------------------------------------------------
// WRITE: ResumeData -> Prisma input builders
// ---------------------------------------------------------------------------

export function buildThemeData(theme: ThemeSettings) {
  return {
    themeId: theme.themeId,
    pageBackground: theme.pageBackground,
    backgroundPattern: theme.backgroundPattern,
    backgroundIntensity: theme.backgroundIntensity,
    dateCalendar: theme.dateCalendar,
    fontFamily: theme.fontFamily,
    fontScale: theme.fontScale,
    lineHeight: theme.lineHeight,
    pageMargin: theme.pageMargin,
    sectionSpacing: theme.sectionSpacing,
    columnIntensity: theme.columnIntensity,
  };
}

export function buildPersonalInfoData(pi: PersonalInfo) {
  return {
    fullName: pi.fullName,
    jobTitle: pi.jobTitle,
    phone: pi.phone,
    location: pi.location,
    email: pi.email,
    dateOfBirth: pi.dateOfBirth,
    nationality: pi.nationality,
    uppercaseName: pi.uppercaseName,
    photoStyle: pi.photoStyle,
    fvJobTitle: pi.fieldVisibility.jobTitle,
    fvPhone: pi.fieldVisibility.phone,
    fvLinks: pi.fieldVisibility.links,
    fvEmail: pi.fieldVisibility.email,
    fvLocation: pi.fieldVisibility.location,
    fvPhoto: pi.fieldVisibility.photo,
    fvDateOfBirth: pi.fieldVisibility.dateOfBirth,
    fvNationality: pi.fieldVisibility.nationality,
    ...buildPhotoColumns(pi.profileImage),
  };
}

function buildPhotoColumns(img: ImageMeta | null) {
  if (!img) {
    return {
      photoMetaId: null,
      photoUrl: null,
      photoOriginalUrl: null,
      photoWidth: null,
      photoHeight: null,
      photoCropX: null,
      photoCropY: null,
      photoCropWidth: null,
      photoCropHeight: null,
      photoCropZoom: null,
    };
  }
  const crop = img.crop;
  return {
    photoMetaId: img.id,
    photoUrl: img.url,
    photoOriginalUrl: img.originalUrl,
    photoWidth: img.width,
    photoHeight: img.height,
    photoCropX: crop ? crop.x : null,
    photoCropY: crop ? crop.y : null,
    photoCropWidth: crop ? crop.width : null,
    photoCropHeight: crop ? crop.height : null,
    photoCropZoom: crop ? crop.zoom : null,
  };
}

export function buildSectionRows(
  resumeId: string,
  sections: ResumeData['sections'],
): Prisma.SectionCreateManyInput[] {
  return sections.map((s) => ({
    id: s.id,
    resumeId,
    type: s.type,
    title: s.title,
    visible: s.visible,
    direction: s.direction,
    order: s.order,
    languageMeterVariant: s.languageMeterVariant,
    languageShowMeter: s.languageShowMeter,
    languageShowLevelText: s.languageShowLevelText,
    showMonth: s.showMonth,
    monthFormat: s.monthFormat,
  }));
}

export function buildLinkRows(
  resumeId: string,
  links: ResumeData['personalInfo']['links'],
): Prisma.PersonalLinkCreateManyInput[] {
  return links.map((l, position) => ({ id: l.id, resumeId, label: l.label, url: l.url, position }));
}

export function buildEducationRows(
  resumeId: string,
  items: ResumeData['education'],
): Prisma.EducationCreateManyInput[] {
  return items.map((ed, position) => ({
    id: ed.id,
    resumeId,
    degree: ed.degree,
    university: ed.university,
    startDate: ed.startDate,
    endDate: ed.endDate,
    gpa: ed.gpa,
    achievements: ed.achievements,
    city: ed.city,
    position,
  }));
}

export function buildProjectRows(
  resumeId: string,
  items: ResumeData['projects'],
): Prisma.ProjectCreateManyInput[] {
  return items.map((p, position) => ({
    id: p.id,
    resumeId,
    name: p.name,
    role: p.role,
    link: p.link,
    linkVisible: p.linkVisible,
    description: p.description,
    position,
  }));
}

export function buildLanguageRows(
  resumeId: string,
  items: ResumeData['languages'],
): Prisma.LanguageCreateManyInput[] {
  return items.map((l, position) => ({
    id: l.id,
    resumeId,
    name: l.name,
    level: l.level,
    showBars: l.showBars,
    showLevelText: l.showLevelText,
    position,
  }));
}

export function buildCertificationRows(
  resumeId: string,
  items: ResumeData['certifications'],
): Prisma.CertificationCreateManyInput[] {
  return items.map((c, position) => ({
    id: c.id,
    resumeId,
    name: c.name,
    issuer: c.issuer,
    date: c.date,
    position,
  }));
}

export function buildExperienceCreateInput(
  resumeId: string,
  exp: ResumeData['experience'][number],
  position: number,
): Prisma.ExperienceCreateInput {
  return {
    id: exp.id,
    resume: { connect: { id: resumeId } },
    jobTitle: exp.jobTitle,
    companyName: exp.companyName,
    periodStart: exp.period.start,
    periodEnd: exp.period.end,
    periodCurrent: exp.period.current,
    city: exp.city,
    projectLink: exp.projectLink,
    projectDescription: exp.projectDescription,
    link: exp.link,
    linkVisible: exp.linkVisible,
    position,
    responsibilities: {
      create: exp.responsibilities.map((r, i) => ({ id: r.id, text: r.text, position: i })),
    },
  };
}

export function buildSkillGroupCreateInput(
  resumeId: string,
  group: ResumeData['skills'][number],
  position: number,
): Prisma.SkillGroupCreateInput {
  return {
    id: group.id,
    resume: { connect: { id: resumeId } },
    name: group.name,
    position,
    skills: {
      create: group.skills.map((s, i) => ({ id: s.id, name: s.name, position: i })),
    },
  };
}
