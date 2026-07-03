import type { CSSProperties } from "react";
import type { ThemeSettings } from "@/types";
import { getThemePreset } from "./presets";

export interface ResolvedTheme {
  /** Strong accent used for section HEADINGS (the most prominent text tier). */
  accent: string;
  /**
   * Secondary title colour — the same hue as {@link accent} but a notch softer
   * (a lighter family tint). Used for the primary entry titles (job/role, degree,
   * project/cert name) so they read as one family, one step down from the section
   * heading. Also the "paired" colour shown on each swatch.
   */
  secondary: string;
  /**
   * Subtitle colour — about two steps lighter than {@link accent} (clearly lighter
   * than {@link secondary}). Used for the entry SUBTITLES (company, university, the
   * job title under the name) which render bold, so this softer tint stays legible
   * while sitting visually beneath the primary entry title.
   */
  subtitle: string;
  /**
   * Body/description text — a soft, desaturated tint of the same family. Readable
   * but recessive, it sits a tier below the secondary titles and is used ONLY for
   * prose (summaries, descriptions, achievements, responsibilities).
   */
  bodyText: string;
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

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * A white-mixed tint scaled by a user intensity. `defaultWhiteMix` is the
 * template's baseline white amount (intensity 1 reproduces it exactly); a higher
 * intensity keeps more of the base colour (stronger), a lower one mixes in more
 * white (lighter). Used by the coloured-column templates so the column tint is
 * user-adjustable while defaulting to its original look.
 */
export function tintColor(hex: string, defaultWhiteMix: number, intensity: number): string {
  const strength = (1 - defaultWhiteMix) * intensity;
  return mixWithWhite(hex, clamp01(1 - strength));
}

/**
 * A darkened shade scaled by a user intensity — the dark-aside counterpart of
 * {@link tintColor}. `defaultDarken` is the baseline darkness (intensity 1 keeps
 * it); higher intensity goes darker/stronger, lower intensity lighter.
 */
export function shadeColor(hex: string, defaultDarken: number, intensity: number): string {
  return darken(hex, Math.max(0, Math.min(0.85, defaultDarken * intensity)));
}

/** Linear blend of two colours: `ratio` 0 → base, 1 → overlay. */
function mix(base: string, overlay: string, ratio: number): string {
  const [r1, g1, b1] = hexToRgb(base);
  const [r2, g2, b2] = hexToRgb(overlay);
  return rgbToHex(
    r1 + (r2 - r1) * ratio,
    g1 + (g2 - g1) * ratio,
    b1 + (b2 - b1) * ratio,
  );
}

/**
 * The softer text tiers derived from a single accent so the whole resume reads as
 * one colour family. `secondary` is a lightly-lightened accent (one notch) for the
 * primary entry titles; `subtitle` is ~two steps lighter for the bold entry
 * subtitles; `bodyText` is a desaturated, soft family tint (mostly a neutral ink
 * with a faint accent cast) for readable prose.
 */
const BODY_INK = "#4a4a52";
export function deriveSecondary(accent: string): string {
  return mixWithWhite(accent, 0.18);
}
export function deriveSubtitle(accent: string): string {
  return mixWithWhite(accent, 0.38);
}
export function deriveBodyText(accent: string): string {
  return mix(BODY_INK, accent, 0.16);
}

/**
 * Single source of truth for the colors a template paints with: the selected
 * preset's accent drives the whole family (heading → secondary → subtitle → body).
 */
export function resolveTheme(theme: ThemeSettings): ResolvedTheme {
  const preset = getThemePreset(theme.themeId);

  return {
    accent: preset.accentDark,
    secondary: deriveSecondary(preset.accentDark),
    subtitle: deriveSubtitle(preset.accentDark),
    bodyText: deriveBodyText(preset.accentDark),
    base: preset.base,
    soft: preset.soft,
    contrastText: preset.contrastText,
  };
}

/**
 * The resume text-tier colours as CSS custom properties, applied once on a page
 * (or column) content wrapper. Nested fields read `var(--rz-secondary)` for the
 * primary entry titles, `var(--rz-subtitle)` for the bold entry subtitles, and
 * `var(--rz-body)` for prose, so the family hierarchy lives in one place instead
 * of being threaded through every block as a prop.
 */
export function resumeTextVars(
  secondary: string,
  bodyText: string,
  subtitle: string,
): CSSProperties {
  return {
    "--rz-secondary": secondary,
    "--rz-subtitle": subtitle,
    "--rz-body": bodyText,
  } as CSSProperties;
}
