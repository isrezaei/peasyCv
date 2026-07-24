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
  militaryService: boolean;
}

export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  phone: string;
  location: string;
  email: string;
  dateOfBirth: string;
  nationality: string;
  militaryService: string;
  links: LinkItem[];
  profileImage: ImageMeta | null;
  uppercaseName: boolean;
  photoStyle: PhotoStyle;
  imageSide: ImageSide;
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
  /** External project link, mirroring `ProjectItem.link` ('' or a valid http(s) URL). */
  link: string;
  /** Whether the entry's external link is rendered. Off hides the link (and its
   *  icon) even when `link` holds a value, so a section option can suppress it. */
  linkVisible: boolean;
  responsibilities: ResponsibilityItem[];
}

// --- skills ----------------------------------------------------------------
export interface SkillItem {
  id: ID;
  name: string;
  /** Proficiency on the shared 1–5 scale; rendered only when the section-wide
   *  `skillShowLevel` toggle is on, but always stored (like the language level). */
  level: LanguageLevel;
}

export interface SkillGroup {
  id: ID;
  name: string;
  /** Whether this group's title row renders — per group, not section-wide. */
  showTitle: boolean;
  skills: SkillItem[];
}

/** How a skills group lays its items out: a wrapping tag row or a bullet list. */
export type SkillDisplayMode = "row" | "list";

/** The skill-level meter reuses the Languages meter shapes, minus the pill. */
export type SkillMeterVariant = Exclude<LanguageMeterVariant, "pill">;

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
  /** Whether the project's external link is rendered. Off hides the link (and its
   *  icon) even when `link` holds a value, so a section option can suppress it. */
  linkVisible: boolean;
  description: string;
}

// --- languages -------------------------------------------------------------
/** Proficiency on a 1–5 dot scale, matching the reference template meters. */
export type LanguageLevel = 1 | 2 | 3 | 4 | 5;

/**
 * Which shape the Languages level meter renders with. Nominal (no order, no
 * arithmetic), so it is stored as a string enum like `direction` and the
 * theme/template ids — never an int ordinal like `LanguageLevel`.
 */
export type LanguageMeterVariant = "bars" | "dots" | "pill" | "line";

export interface LanguageItem {
  id: ID;
  name: string;
  level: LanguageLevel;
  /** Whether the 5-bar level meter renders. Independent of the level word. */
  showBars: boolean;
  /** Whether the level word (derived from `level`, never stored) renders. */
  showLevelText: boolean;
}

// --- certifications --------------------------------------------------------
export interface CertificationItem {
  id: ID;
  name: string;
  issuer: string;
  date: string;
}

// --- achievements ----------------------------------------------------------
export interface AchievementItem {
  id: ID;
  title: string;
  description: string;
}

// --- sections --------------------------------------------------------------
export type RemovableSectionType =
  | "summary"
  | "experience"
  | "skills"
  | "education"
  | "projects"
  | "languages"
  | "certifications"
  | "achievements";

export type SectionType = "personalInfo" | RemovableSectionType;

/**
 * How a period date's month renders: the localized month name («فروردین») or its
 * ordinal («12»). The label is always DERIVED from the stored ISO date — never
 * stored — like the languages level word.
 */
export type MonthFormat = "name" | "number";

export interface SectionMeta {
  id: ID;
  type: RemovableSectionType;
  title: string;
  visible: boolean;
  direction: Direction;
  order: number;
  /** Languages-section display settings — section-wide, meaningful only for
   *  type "languages" but present (defaulted) on every section like `direction`. */
  languageMeterVariant: LanguageMeterVariant;
  languageShowMeter: boolean;
  languageShowLevelText: boolean;
  /** Period-date display settings — section-wide, meaningful for the dated
   *  sections ("experience", "education") but present (defaulted) on every
   *  section like the languages settings. Each section row keeps its own pair,
   *  so Experience and Education are configured independently. */
  showMonth: boolean;
  monthFormat: MonthFormat;
  /** Achievements-section display settings — section-wide, meaningful only for
   *  type "achievements" but present (defaulted) on every section like the
   *  languages settings. The item TITLE is always rendered (no toggle). */
  achievementShowDescription: boolean;
  achievementShowIcons: boolean;
  /** Skills-section display settings — section-wide, meaningful only for type
   *  "skills" but present (defaulted) on every section like the languages
   *  settings. The per-group title toggle lives on the group itself. */
  skillDisplayMode: SkillDisplayMode;
  skillShowLevel: boolean;
  skillMeterVariant: SkillMeterVariant;
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
  | "indigo"
  | "navyGold"
  | "crimsonCopper"
  | "violetOrange"
  | "midnightMint"
  | "azurePeach"
  | "charcoalLemon"
  | "charcoalAmber"
  | "smokyCoral"
  | "charcoalJade"
  | "purpleRose"
  | "inkFuchsia"
  | "graphiteGold"
  | "greenBlue"
  | "pinky";

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

/** Profile photo corner shape: full circle, rounded (lg) corners, or sharp (no rounding). */
export type PhotoStyle = "round" | "square" | "sharp";

/** Which physical side the personal-info photo sits on in the inline header. */
export type ImageSide = "left" | "right";

export type CalendarSystem = "jalali" | "hijri" | "gregorian";

/**
 * Width preset for the coloured side column of the column templates. "medium"
 * is each template's original width; the other steps widen/narrow it by a fixed
 * offset while the main column always stays the wider of the two.
 */
export type ColumnWidthId = "small" | "medium" | "large" | "xlarge";

export interface ThemeSettings {
  themeId: ThemeId;
  /** DEAD FIELD — retained for back-compat only; the page is always white now. */
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
  /**
   * Width preset of the coloured side column in the column templates. Default
   * "medium" keeps each template's original width so existing résumés are
   * unchanged until the user picks another size.
   */
  columnWidth: ColumnWidthId;
  /** Resume-wide toggle: show the section's icon beside each section heading. */
  showSectionIcons: boolean;
  /** Resume-wide toggle: draw a thin theme-tinted hairline under each section title. */
  showSectionSeparators: boolean;
  /**
   * ATS Friendly mode: render the résumé as a single-column, decoration-free,
   * plain-black-on-white document (and real text nodes, not form controls, on
   * the print/PDF surface) so applicant-tracking systems can parse it. Default
   * false so existing résumés are unchanged until the user opts in.
   */
  atsMode: boolean;
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
  /** Per-resume occupation-category id (see OCCUPATION_CATEGORY_IDS mirrors);
   *  null = not chosen. Optional so payloads persisted before the field existed
   *  stay assignable; only the id travels — Persian labels derive via i18n. */
  occupationCategory?: string | null;
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
  achievements: AchievementItem[];
}

// --- API auxiliary contracts ----------------------------------------------
/** Summary row returned by the list endpoint (GET /resumes). */
export interface ResumeSummary {
  id: ID;
  title: string;
  templateId: TemplateId;
  /** Occupation-category id for this resume (null = not chosen). */
  occupationCategory: string | null;
  updatedAt: string;
  createdAt: string;
}

/** Public, read-only share payload (GET /share/:token). */
export interface PublicResume {
  resume: ResumeData;
  ownerName: string | null;
}
