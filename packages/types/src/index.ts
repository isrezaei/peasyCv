/**
 * Shared resume contract types.
 *
 * This package MIRRORS `frontend/src/types` — the frontend is the source of
 * truth for the ResumeData shape. The backend imports these so its DTOs and the
 * Prisma <-> API serialization round-trip to the exact shape the frontend store
 * and SWR hooks consume. If a field changes in the frontend types, update it
 * here too (the backend's e2e/round-trip tests will catch drift).
 */

// --- common ----------------------------------------------------------------
export type Direction = "rtl" | "ltr";

export type ID = string;

export interface Timestamped {
  createdAt: string;
  updatedAt: string;
}

// --- image -----------------------------------------------------------------
export interface ImageCrop {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
}

export interface ImageMeta {
  id: ID;
  url: string;
  originalUrl: string;
  width: number;
  height: number;
  crop: ImageCrop | null;
}

// --- personal info ---------------------------------------------------------
export interface LinkItem {
  id: ID;
  label: string;
  url: string;
}

export interface PersonalInfoFieldVisibility {
  jobTitle: boolean;
  phone: boolean;
  links: boolean;
  email: boolean;
  location: boolean;
  photo: boolean;
  dateOfBirth: boolean;
  nationality: boolean;
}

export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  phone: string;
  location: string;
  email: string;
  dateOfBirth: string;
  nationality: string;
  links: LinkItem[];
  profileImage: ImageMeta | null;
  uppercaseName: boolean;
  photoStyle: PhotoStyle;
  fieldVisibility: PersonalInfoFieldVisibility;
}

// --- summary ---------------------------------------------------------------
export interface SummaryContent {
  html: string;
}

// --- experience ------------------------------------------------------------
export interface EmploymentPeriod {
  start: string;
  end: string;
  current: boolean;
}

export interface ResponsibilityItem {
  id: ID;
  text: string;
}

export interface ExperienceItem {
  id: ID;
  jobTitle: string;
  companyName: string;
  period: EmploymentPeriod;
  city: string;
  projectLink: string;
  projectDescription: string;
  responsibilities: ResponsibilityItem[];
}

// --- skills ----------------------------------------------------------------
export interface SkillItem {
  id: ID;
  name: string;
}

export interface SkillGroup {
  id: ID;
  name: string;
  skills: SkillItem[];
}

// --- education -------------------------------------------------------------
export interface EducationItem {
  id: ID;
  degree: string;
  university: string;
  startDate: string;
  endDate: string;
  gpa: string;
  achievements: string;
  city: string;
}

// --- projects --------------------------------------------------------------
export interface ProjectItem {
  id: ID;
  name: string;
  role: string;
  link: string;
  description: string;
}

// --- languages -------------------------------------------------------------
/** Proficiency on a 1–5 dot scale, matching the reference template meters. */
export type LanguageLevel = 1 | 2 | 3 | 4 | 5;

export interface LanguageItem {
  id: ID;
  name: string;
  level: LanguageLevel;
}

// --- certifications --------------------------------------------------------
export interface CertificationItem {
  id: ID;
  name: string;
  issuer: string;
  date: string;
}

// --- sections --------------------------------------------------------------
export type RemovableSectionType =
  | "summary"
  | "experience"
  | "skills"
  | "education"
  | "projects"
  | "languages"
  | "certifications";

export type SectionType = "personalInfo" | RemovableSectionType;

export interface SectionMeta {
  id: ID;
  type: RemovableSectionType;
  title: string;
  visible: boolean;
  direction: Direction;
  order: number;
}

// --- theme -----------------------------------------------------------------
export type ThemeId =
  | "sage"
  | "lavender"
  | "skyBlue"
  | "dustyRose"
  | "mint"
  | "softCoral"
  | "peach"
  | "ocean"
  | "slate"
  | "grey"
  | "indigo";

export type PageBackgroundMode = "theme" | "white";

export type BackgroundPatternId =
  | "none"
  | "blobs"
  | "botanical"
  | "bracketsRings"
  | "chevronField"
  | "concentricArcs"
  | "dotGrid"
  | "topoLines";

export type FontFamilyId =
  | "vazirmatn"
  | "ibmPlexArabic"
  | "notoArabic"
  | "cairo"
  | "montserrat"
  | "inter";

export type PhotoStyle = "round" | "square";

export type CalendarSystem = "jalali" | "hijri" | "gregorian";

export interface ThemeSettings {
  themeId: ThemeId;
  pageBackground: PageBackgroundMode;
  backgroundPattern: BackgroundPatternId;
  backgroundIntensity: number;
  dateCalendar: CalendarSystem;
  fontFamily: FontFamilyId;
  fontScale: number;
  lineHeight: number;
  pageMargin: number;
  sectionSpacing: number;
  columnIntensity: number;
}

// --- template --------------------------------------------------------------
export type TemplateId =
  | "professional-single-column"
  | "double-column"
  | "sidebar-column"
  | "aside-dark"
  | "aside-photo"
  | "timeline-panel"
  | "header-band"
  | "compact-duo"
  | "ruled-single"
  | "classic-centered";

// --- resume (root) ---------------------------------------------------------
export interface ResumeData extends Timestamped {
  id: ID;
  title: string;
  locale: "fa" | "en";
  templateId: TemplateId;
  theme: ThemeSettings;
  sections: SectionMeta[];
  personalInfo: PersonalInfo;
  summary: SummaryContent;
  experience: ExperienceItem[];
  skills: SkillGroup[];
  education: EducationItem[];
  projects: ProjectItem[];
  languages: LanguageItem[];
  certifications: CertificationItem[];
}

// --- API auxiliary contracts ----------------------------------------------
/** Summary row returned by the list endpoint (GET /resumes). */
export interface ResumeSummary {
  id: ID;
  title: string;
  templateId: TemplateId;
  updatedAt: string;
  createdAt: string;
}

/** Public, read-only share payload (GET /share/:token). */
export interface PublicResume {
  resume: ResumeData;
  ownerName: string | null;
}
