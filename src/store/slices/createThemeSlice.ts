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

export const createThemeSlice: SliceCreator<ThemeSlice> = (set) => ({
  setThemeId: (themeId) => patchTheme(set, () => ({ themeId, customColor: null })),
  setCustomColor: (customColor) => patchTheme(set, () => ({ customColor })),
  setPageBackground: (mode) => patchTheme(set, () => ({ pageBackground: mode })),
  setBackgroundPattern: (pattern) => patchTheme(set, () => ({ backgroundPattern: pattern })),
  setDateCalendar: (dateCalendar) => patchTheme(set, () => ({ dateCalendar })),
  setFontFamily: (fontFamily) => patchTheme(set, () => ({ fontFamily })),
  setFontScale: (scale) => patchTheme(set, () => ({ fontScale: clamp(scale, 0.85, 1.3) })),
  setLineHeight: (lineHeight) => patchTheme(set, () => ({ lineHeight: clamp(lineHeight, 1.1, 2) })),
  setPageMargin: (margin) => patchTheme(set, () => ({ pageMargin: clamp(margin, 8, 24) })),
  setSectionSpacing: (spacing) =>
    patchTheme(set, () => ({ sectionSpacing: clamp(spacing, 2, 12) })),
  setTemplate: (templateId) =>
    set((state) => ({
      resume: { ...state.resume, templateId, updatedAt: touch() },
    })),
});
