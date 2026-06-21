import type { ThemeSettings } from "@/types";
import { getThemePreset } from "./presets";

export interface ResolvedTheme {
  /** Primary accent used for section titles, company names, sidebar fills. */
  accent: string;
  /** Soft tint used for the page background and chips. */
  soft: string;
  /** Mid-tone used for decorative shapes. */
  base: string;
  /** Text color that reads on top of the accent. */
  contrastText: string;
}

function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const int = parseInt(full, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((c) => clampChannel(c).toString(16).padStart(2, "0")).join("")}`;
}

export function mixWithWhite(hex: string, ratio: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * ratio, g + (255 - g) * ratio, b + (255 - b) * ratio);
}

export function darken(hex: string, ratio: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * (1 - ratio), g * (1 - ratio), b * (1 - ratio));
}

/**
 * Single source of truth for the colors a template paints with. When the user
 * picks a custom color it overrides the preset; otherwise the preset is used.
 */
export function resolveTheme(theme: ThemeSettings): ResolvedTheme {
  const preset = getThemePreset(theme.themeId);

  if (theme.customColor) {
    return {
      accent: theme.customColor,
      base: mixWithWhite(theme.customColor, 0.45),
      soft: mixWithWhite(theme.customColor, 0.88),
      contrastText: "#FFFFFF",
    };
  }

  return {
    accent: preset.accentDark,
    base: preset.base,
    soft: preset.soft,
    contrastText: preset.contrastText,
  };
}
