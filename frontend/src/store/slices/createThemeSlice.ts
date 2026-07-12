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
  setThemeId: (themeId) => patchTheme(set, () => ({ themeId })),
  setPageBackground: (mode) => patchTheme(set, () => ({ pageBackground: mode })),
  setBackgroundPattern: (pattern) => patchTheme(set, () => ({ backgroundPattern: pattern })),
  setBackgroundIntensity: (intensity) =>
    patchTheme(set, () => ({ backgroundIntensity: clamp(intensity, 0.1, 1.25) })),
  setDateCalendar: (dateCalendar) => patchTheme(set, () => ({ dateCalendar })),
  setFontFamily: (fontFamily) => patchTheme(set, () => ({ fontFamily })),
  setFontScale: (scale) => patchTheme(set, () => ({ fontScale: clamp(scale, 0.85, 1.3) })),
  setLineHeight: (lineHeight) => patchTheme(set, () => ({ lineHeight: clamp(lineHeight, 1.1, 2) })),
  setPageMargin: (margin) => patchTheme(set, () => ({ pageMargin: clamp(margin, 8, 24) })),
  setSectionSpacing: (spacing) =>
    patchTheme(set, () => ({ sectionSpacing: clamp(spacing, 2, 12) })),
  setColumnIntensity: (intensity) =>
    patchTheme(set, () => ({ columnIntensity: clamp(intensity, 0.5, 1.5) })),
  setShowSectionIcons: (show) => patchTheme(set, () => ({ showSectionIcons: show })),
  setColumnStyle: (style) => patchTheme(set, () => ({ columnStyle: style })),
  setTemplate: (templateId) =>
    set((state) => ({
      resume: { ...state.resume, templateId, updatedAt: touch() },
    })),
});
