import type { StateCreator } from "zustand";
import type {
  BackgroundPatternId,
  CalendarSystem,
  CertificationItem,
  Direction,
  EducationItem,
  ExperienceItem,
  FontFamilyId,
  ID,
  ImageMeta,
  LanguageItem,
  LanguageLevel,
  LinkItem,
  PageBackgroundMode,
  PersonalInfo,
  PersonalInfoFieldVisibility,
  PhotoStyle,
  ProjectItem,
  ResumeData,
  TemplateId,
  ThemeId,
} from "@/types";

export interface ResumeSlice {
  resume: ResumeData;
  setResume: (resume: ResumeData) => void;

  updatePersonalInfo: (patch: Partial<PersonalInfo>) => void;
  setProfileImage: (image: ImageMeta) => void;
  removeProfileImage: () => void;
  setPhotoStyle: (style: PhotoStyle) => void;
  toggleField: (field: keyof PersonalInfoFieldVisibility) => void;
  setUppercaseName: (enabled: boolean) => void;
  addLink: () => void;
  updateLink: (id: ID, patch: Partial<Omit<LinkItem, "id">>) => void;
  removeLink: (id: ID) => void;

  updateSummary: (html: string) => void;

  addExperience: () => void;
  updateExperience: (
    id: ID,
    patch: Partial<Omit<ExperienceItem, "id" | "responsibilities">>,
  ) => void;
  removeExperience: (id: ID) => void;
  addResponsibility: (experienceId: ID) => void;
  /** Insert a new empty responsibility right after `afterId`; returns its id so
   *  the caller (the list editor) can focus the new line. */
  addResponsibilityAfter: (experienceId: ID, afterId: ID) => ID;
  updateResponsibility: (experienceId: ID, responsibilityId: ID, text: string) => void;
  removeResponsibility: (experienceId: ID, responsibilityId: ID) => void;

  addSkillGroup: () => void;
  updateSkillGroup: (id: ID, name: string) => void;
  removeSkillGroup: (id: ID) => void;
  addSkill: (groupId: ID) => void;
  updateSkill: (groupId: ID, skillId: ID, name: string) => void;
  removeSkill: (groupId: ID, skillId: ID) => void;

  addEducation: () => void;
  updateEducation: (id: ID, patch: Partial<Omit<EducationItem, "id">>) => void;
  removeEducation: (id: ID) => void;

  addProject: () => void;
  updateProject: (id: ID, patch: Partial<Omit<ProjectItem, "id">>) => void;
  removeProject: (id: ID) => void;

  addLanguage: () => void;
  updateLanguage: (id: ID, patch: Partial<Omit<LanguageItem, "id">>) => void;
  setLanguageLevel: (id: ID, level: LanguageLevel) => void;
  removeLanguage: (id: ID) => void;

  addCertification: () => void;
  updateCertification: (id: ID, patch: Partial<Omit<CertificationItem, "id">>) => void;
  removeCertification: (id: ID) => void;
}

export interface SectionsSlice {
  reorderSections: (orderedIds: ID[]) => void;
  toggleSectionVisibility: (id: ID) => void;
  setSectionDirection: (id: ID, direction: Direction) => void;
}

export interface ThemeSlice {
  setThemeId: (themeId: ThemeId) => void;
  setCustomColor: (color: string | null) => void;
  setPageBackground: (mode: PageBackgroundMode) => void;
  setBackgroundPattern: (pattern: BackgroundPatternId) => void;
  setDateCalendar: (calendar: CalendarSystem) => void;
  setFontFamily: (fontFamily: FontFamilyId) => void;
  setFontScale: (scale: number) => void;
  setLineHeight: (lineHeight: number) => void;
  setPageMargin: (margin: number) => void;
  setSectionSpacing: (spacing: number) => void;
  setTemplate: (templateId: TemplateId) => void;
}

export type SaveStatus = "idle" | "saving" | "saved";

export type ActivePanel = "design" | "templates" | "rearrange";

export interface UiSlice {
  isHydrated: boolean;
  saveStatus: SaveStatus;
  activePanel: ActivePanel;
  /** Whether the floating contextual sidebar is collapsed (slid closed). */
  sidebarCollapsed: boolean;
  setHydrated: (hydrated: boolean) => void;
  setSaveStatus: (status: SaveStatus) => void;
  setActivePanel: (panel: ActivePanel) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export type RootStore = ResumeSlice & SectionsSlice & ThemeSlice & UiSlice;

export type SliceCreator<T> = StateCreator<RootStore, [], [], T>;
