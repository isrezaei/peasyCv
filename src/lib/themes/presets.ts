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
  indigo: {
    id: "indigo",
    label: t.theme.names.indigo,
    // Tuned to the 2026 redesign accent (#5B5BD6) so it matches the app chrome.
    soft: "#F0F1FC",
    base: "#C2C4EF",
    accentDark: "#5B5BD6",
    contrastText: "#FFFFFF",
  },
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
  "slate",
];

export function getThemePreset(themeId: ThemeId): ThemePreset {
  return themePresets[themeId];
}
