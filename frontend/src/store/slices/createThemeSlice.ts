import { pingSelection } from "@/lib/metrics/selectionBeacon";
import type { SliceCreator, ThemeSlice } from "../types";

const touch = () => new Date().toISOString();

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function patchTheme(
  set: Parameters<SliceCreator<ThemeSlice>>[0],
  patch: (theme: import("@/types").ThemeSettings) => Partial<import("@/types").ThemeSettings>,
) {
  set((state) => ({
    resume: {
      ...state.resume,
      theme: { ...state.resume.theme, ...patch(state.resume.theme) },
      updatedAt: touch(),
    },
  }));
}

export const createThemeSlice: SliceCreator<ThemeSlice> = (set, get) => ({
  setThemeId: (themeId) => {
    // Fire the analytics beacon only on a real user change — never on load or
    // hydration (those replace the resume wholesale, not via this setter).
    if (get().resume.theme.themeId !== themeId) pingSelection("theme", themeId);
    patchTheme(set, () => ({ themeId }));
  },
  // DEAD SETTER — the colored-page control was removed (page is always white). Kept
  // on the slice so the persisted `pageBackground` field still round-trips.
  setPageBackground: (mode) => patchTheme(set, () => ({ pageBackground: mode })),
  setBackgroundPattern: (pattern) => {
    if (get().resume.theme.backgroundPattern !== pattern) pingSelection("background", pattern);
    patchTheme(set, () => ({ backgroundPattern: pattern }));
  },
  setBackgroundIntensity: (intensity) =>
    patchTheme(set, () => ({ backgroundIntensity: clamp(intensity, 0.1, 1.25) })),
  setDateCalendar: (dateCalendar) => patchTheme(set, () => ({ dateCalendar })),
  setFontFamily: (fontFamily) => {
    if (get().resume.theme.fontFamily !== fontFamily) pingSelection("font", fontFamily);
    patchTheme(set, () => ({ fontFamily }));
  },
  setFontScale: (scale) => patchTheme(set, () => ({ fontScale: clamp(scale, 0.85, 1.3) })),
  setLineHeight: (lineHeight) => patchTheme(set, () => ({ lineHeight: clamp(lineHeight, 1.1, 2) })),
  setPageMargin: (margin) => patchTheme(set, () => ({ pageMargin: clamp(margin, 8, 24) })),
  setSectionSpacing: (spacing) =>
    patchTheme(set, () => ({ sectionSpacing: clamp(spacing, 2, 12) })),
  setColumnIntensity: (intensity) =>
    patchTheme(set, () => ({ columnIntensity: clamp(intensity, 0.5, 2) })),
  setColumnWidth: (columnWidth) => patchTheme(set, () => ({ columnWidth })),
  setShowSectionIcons: (show) => patchTheme(set, () => ({ showSectionIcons: show })),
  setShowSectionSeparators: (show) =>
    patchTheme(set, () => ({ showSectionSeparators: show })),
  setAtsMode: (enabled) => patchTheme(set, () => ({ atsMode: enabled })),
  setTemplate: (templateId) => {
    if (get().resume.templateId !== templateId) pingSelection("template", templateId);
    set((state) => ({
      resume: { ...state.resume, templateId, updatedAt: touch() },
    }));
  },
});
