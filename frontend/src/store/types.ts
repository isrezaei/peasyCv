import type { StateCreator } from "zustand";
import type {
  AchievementItem,
  BackgroundPatternId,
  CalendarSystem,
  CertificationItem,
  ColumnWidthId,
  Direction,
  EducationItem,
  ExperienceItem,
  FontFamilyId,
  ID,
  ImageMeta,
  ImageSide,
  LanguageItem,
  LanguageLevel,
  LanguageMeterVariant,
  LinkItem,
  MonthFormat,
  PageBackgroundMode,
  PersonalInfo,
  PersonalInfoFieldVisibility,
  PhotoStyle,
  ProjectItem,
  ResumeData,
  SkillDisplayMode,
  SkillGroup,
  SkillMeterVariant,
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
  setImageSide: (side: ImageSide) => void;
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
   *  the caller (the list editor) can focus the new line. When the entry has
   *  already filled to its page's bottom margin (per the active template's
   *  pagination model), the line is created as the first bullet of a NEW sibling
   *  entry right after it instead — the full entry stays put and the new entry
   *  lands on the next page. */
  addResponsibilityAfter: (experienceId: ID, afterId: ID) => ID;
  updateResponsibility: (experienceId: ID, responsibilityId: ID, text: string) => void;
  removeResponsibility: (experienceId: ID, responsibilityId: ID) => void;

  addSkillGroup: () => void;
  updateSkillGroup: (id: ID, patch: Partial<Omit<SkillGroup, "id" | "skills">>) => void;
  removeSkillGroup: (id: ID) => void;
  addSkill: (groupId: ID) => void;
  /** Insert a new empty skill right after `afterId`; returns its id so the list
   *  editor can focus the new line (mirror of addResponsibilityAfter). */
  addSkillAfter: (groupId: ID, afterId: ID) => ID;
  updateSkill: (groupId: ID, skillId: ID, name: string) => void;
  setSkillLevel: (groupId: ID, skillId: ID, level: LanguageLevel) => void;
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

  addAchievement: () => void;
  updateAchievement: (id: ID, patch: Partial<Omit<AchievementItem, "id">>) => void;
  removeAchievement: (id: ID) => void;
}

export interface SectionsSlice {
  reorderSections: (orderedIds: ID[]) => void;
  toggleSectionVisibility: (id: ID) => void;
  setSectionDirection: (id: ID, direction: Direction) => void;
  // The generic section-wide display-settings patch (implementation just spreads
  // it onto the section row); carries the languages settings, the
  // experience/education period-date settings and the achievements settings.
  setSectionLanguageSettings: (
    id: ID,
    patch: Partial<{
      languageMeterVariant: LanguageMeterVariant;
      languageShowMeter: boolean;
      languageShowLevelText: boolean;
      showMonth: boolean;
      monthFormat: MonthFormat;
      achievementShowDescription: boolean;
      achievementShowIcons: boolean;
      skillDisplayMode: SkillDisplayMode;
      skillShowLevel: boolean;
      skillMeterVariant: SkillMeterVariant;
    }>,
  ) => void;
}

export interface ThemeSlice {
  setThemeId: (themeId: ThemeId) => void;
  setPageBackground: (mode: PageBackgroundMode) => void;
  setBackgroundPattern: (pattern: BackgroundPatternId) => void;
  setBackgroundIntensity: (intensity: number) => void;
  setDateCalendar: (calendar: CalendarSystem) => void;
  setFontFamily: (fontFamily: FontFamilyId) => void;
  setFontScale: (scale: number) => void;
  setLineHeight: (lineHeight: number) => void;
  setPageMargin: (margin: number) => void;
  setSectionSpacing: (spacing: number) => void;
  setColumnIntensity: (intensity: number) => void;
  setColumnWidth: (width: ColumnWidthId) => void;
  setShowSectionIcons: (show: boolean) => void;
  setShowSectionSeparators: (show: boolean) => void;
  setAtsMode: (enabled: boolean) => void;
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
  /**
   * Download-time validation feedback. A download attempt with enabled-but-empty
   * required fields flips this on: the editor's field primitives then paint a
   * soft-red highlight over their (empty) placeholders (the blocked attempt also
   * fires a bottom-left validation toast). This state is EDITOR chrome only — it
   * is surfaced to fields through EmptyHighlightContext, which the /print and
   * /share surfaces never provide, so it can never reach a PDF.
   */
  emptyHighlightActive: boolean;
  /**
   * Monotonic counter bumped once per blocked download attempt (every call to
   * {@link UiSlice.activateEmptyHighlights}), including consecutive attempts that
   * leave `emptyHighlightActive` already-true. Chrome that must re-fire on EACH
   * attempt — the Download button's red-shake feedback — subscribes to this
   * rather than the boolean, so a repeat click still triggers even when no other
   * state changed. Fires in lockstep with the validation toast.
   */
  emptyHighlightNonce: number;
  setHydrated: (hydrated: boolean) => void;
  setSaveStatus: (status: SaveStatus) => void;
  setActivePanel: (panel: ActivePanel) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  /** Turn on the empty-field highlights (a download attempt that was blocked by
   *  empty required fields). */
  activateEmptyHighlights: () => void;
  /** Clear the highlights (a download that passed validation). */
  clearEmptyHighlights: () => void;
}

export type RootStore = ResumeSlice & SectionsSlice & ThemeSlice & UiSlice;

export type SliceCreator<T> = StateCreator<RootStore, [], [], T>;
