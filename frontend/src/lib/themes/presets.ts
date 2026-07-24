import { t } from "@/lib/i18n";
import type { ThemeId, ThemePreset } from "@/types";

export const themePresets: Record<ThemeId, ThemePreset> = {
  sage: {
    id: "sage",
    label: t.theme.names.sage,
    soft: "#F1F6EE",
    base: "#B7CDA8",
    accentDark: "#4F6B43",
    contrastText: "#FFFFFF",
  },
  lavender: {
    id: "lavender",
    label: t.theme.names.lavender,
    soft: "#F4F1FA",
    base: "#C9B8E8",
    accentDark: "#5B3E96",
    contrastText: "#FFFFFF",
  },
  skyBlue: {
    id: "skyBlue",
    label: t.theme.names.skyBlue,
    soft: "#EFF6FB",
    base: "#A9D4EE",
    accentDark: "#2E6F9E",
    contrastText: "#FFFFFF",
  },
  dustyRose: {
    id: "dustyRose",
    label: t.theme.names.dustyRose,
    soft: "#FAF0F1",
    base: "#E3B7BD",
    accentDark: "#99404B",
    contrastText: "#FFFFFF",
  },
  mint: {
    id: "mint",
    label: t.theme.names.mint,
    soft: "#EEFAF4",
    base: "#A8E0C5",
    accentDark: "#1F7A57",
    contrastText: "#FFFFFF",
  },
  softCoral: {
    id: "softCoral",
    label: t.theme.names.softCoral,
    soft: "#FDF1EE",
    base: "#F1AE9D",
    accentDark: "#B5503A",
    contrastText: "#FFFFFF",
  },
  peach: {
    id: "peach",
    label: t.theme.names.peach,
    soft: "#FDF4EC",
    base: "#F3CBA0",
    accentDark: "#B97A2E",
    contrastText: "#FFFFFF",
  },
  ocean: {
    id: "ocean",
    label: t.theme.names.ocean,
    soft: "#EAF5F6",
    base: "#8FCAD3",
    accentDark: "#1F6470",
    contrastText: "#FFFFFF",
  },
  slate: {
    id: "slate",
    label: t.theme.names.slate,
    soft: "#F0F2F4",
    base: "#AAB8C2",
    accentDark: "#3C4A56",
    contrastText: "#FFFFFF",
  },
  // A true neutral grey (near-zero saturation), distinct from the blue-grey
  // "slate" above. Follows the same token shape so patterns, accents, titles and
  // swatches all work in grey exactly like every coloured theme.
  grey: {
    id: "grey",
    label: t.theme.names.grey,
    soft: "#F3F4F5",
    base: "#C3C6CA",
    accentDark: "#4B4F55",
    contrastText: "#FFFFFF",
  },
  indigo: {
    id: "indigo",
    label: t.theme.names.indigo,
    // Tuned to the 2026 redesign accent (#5B5BD6) so it matches the app chrome.
    soft: "#F0F1FC",
    base: "#C2C4EF",
    accentDark: "#5B5BD6",
    contrastText: "#FFFFFF",
  },
  // Two-tone brand palettes: accentDark is the darker brand colour (drives all
  // text tiers), base the lighter companion (decorative shapes / column tints),
  // soft an ~85% white mix of the base like every entry above.
  navyGold: {
    id: "navyGold",
    label: t.theme.names.navyGold,
    soft: "#FAF2E4",
    base: "#DDA94B",
    accentDark: "#1E4174",
    contrastText: "#FFFFFF",
  },
  crimsonCopper: {
    id: "crimsonCopper",
    label: t.theme.names.crimsonCopper,
    soft: "#F4E8E0",
    base: "#B5642E",
    accentDark: "#A4193D",
    contrastText: "#FFFFFF",
  },
  violetOrange: {
    id: "violetOrange",
    label: t.theme.names.violetOrange,
    soft: "#F9E6DF",
    base: "#DA5A2A",
    accentDark: "#3B1877",
    contrastText: "#FFFFFF",
  },
  midnightMint: {
    id: "midnightMint",
    label: t.theme.names.midnightMint,
    soft: "#F3FDF8",
    // Deepened from the original #ADEFD1 (same mint hue): as the vivid marker /
    // subtitle colour it measures 4.32:1 on white and 3.29:1 on the default
    // vivid page tint, clearing the 3:1 non-text floor the original missed.
    base: "#94C5A2",
    accentDark: "#1E8A60",
    contrastText: "#FFFFFF",
  },
  azurePeach: {
    id: "azurePeach",
    label: t.theme.names.azurePeach,
    soft: "#FCF1EC",
    base: "#EEA47F",
    accentDark: "#00539C",
    contrastText: "#FFFFFF",
  },
  charcoalLemon: {
    id: "charcoalLemon",
    label: t.theme.names.charcoalLemon,
    soft: "#FFFBDC",
    // Deepened from the original #FEE715 (same yellow hue): as the vivid marker /
    // subtitle colour it measures 4.33:1 on white and 3.32:1 on the default
    // vivid page tint, clearing the 3:1 non-text floor the original missed.
    base: "#8F7800",
    accentDark: "#101820",
    contrastText: "#FFFFFF",
  },
  charcoalAmber: {
    id: "charcoalAmber",
    label: t.theme.names.charcoalAmber,
    soft: "#FDF2E4",
    base: "#F2AA4C",
    accentDark: "#5D2523",
    contrastText: "#FFFFFF",
  },
  smokyCoral: {
    id: "smokyCoral",
    label: t.theme.names.smokyCoral,
    soft: "#FCE9E8",
    base: "#87C94C",
    accentDark: "#603F83",
    contrastText: "#FFFFFF",
  },
  charcoalJade: {
    id: "charcoalJade",
    label: t.theme.names.charcoalJade,
    soft: "#DDEBE4",
    base: "#1A7A4C",
    accentDark: "#101820",
    contrastText: "#FFFFFF",
  },
  purpleRose: {
    id: "purpleRose",
    label: t.theme.names.purpleRose,
    soft: "#FAE8ED",
    base: "#DF6589",
    accentDark: "#3165F6",
    contrastText: "#FFFFFF",
  },
  inkFuchsia: {
    id: "inkFuchsia",
    label: t.theme.names.inkFuchsia,
    soft: "#F8E4EC",
    base: "#CE4A7E",
    accentDark: "#1C1C1B",
    contrastText: "#FFFFFF",
  },
  graphiteGold: {
    id: "graphiteGold",
    label: t.theme.names.graphiteGold,
    soft: "#FEF8E3",
    base: "#AFAEAC",
    accentDark: "#53929E",
    contrastText: "#FFFFFF",
  },
  greenBlue : {
    id: "greenBlue",
    label: t.theme.names.greenBlue,
    soft: "#FEF8E3",
    base: "#9FCFEB",
    accentDark: "#3DB86E",
    contrastText: "#FFFFFF",
  },
  pinky : {
    id: "pinky",
    label: t.theme.names.pinky,
    soft: "#FEF8E3",
    base: "#F4A2A1",
    accentDark: "#CC4261",
    contrastText: "#FFFFFF",
  }
};

export const themeOrder: ThemeId[] = [
  "indigo",
  "sage",
  "lavender",
  "skyBlue",
  "dustyRose",
  "mint",
  "softCoral",
  "peach",
  "ocean",
  "grey",
];

/**
 * The two-tone brand palettes rendered by the VIVID logic (raw primary text on a
 * lightened-secondary background) instead of the classic accent-derivation. This
 * array is the single source of truth for the vivid family: it is both the
 * display order of the «غیرهمسان» swatch grid and, via {@link isVividThemeId},
 * the membership test that routes rendering to `resolveThemeVivid`. The ids stay
 * in `themePresets`/`THEME_IDS` so saved resumes keep validating; only the
 * display list and render path are split.
 */
export const vividThemeOrder: ThemeId[] = [
  "crimsonCopper",
  "violetOrange",
  "midnightMint",
  "azurePeach",
  "charcoalAmber",
  "smokyCoral",
  "purpleRose",
  "graphiteGold",
  "greenBlue",
  "pinky"
];

/** Whether a theme id belongs to the vivid family (mode is derived, never stored). */
export function isVividThemeId(themeId: ThemeId): boolean {
  return vividThemeOrder.includes(themeId);
}

/**
 * Whether a persisted string is a known theme id. Hydration (`normalizeTheme`)
 * allowlists every incoming themeId through this, so a retired/renamed id in an
 * old payload can never reach the render path.
 */
export function isThemeId(value: string): value is ThemeId {
  return Object.hasOwn(themePresets, value);
}

export function getThemePreset(themeId: ThemeId): ThemePreset {
  // Fail safe: hydration already allowlists themeId, but if an unknown id ever
  // reaches here anyway (a stale in-memory value, a future missed migration),
  // resolve to the default preset instead of returning undefined — reading
  // `.accentDark` off undefined white-screens the editor and hangs /print.
  return themePresets[themeId] ?? themePresets.indigo;
}
