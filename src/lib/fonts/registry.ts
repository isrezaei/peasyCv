import type { FontFamilyId } from "@/types";

export interface FontOption {
  id: FontFamilyId;
  label: string;
  /** CSS font-family stack referencing the next/font CSS variable. */
  stack: string;
  script: "persian" | "latin";
}

export const fontOptions: FontOption[] = [
  { id: "vazirmatn", label: "وزیر متن", stack: "var(--font-vazirmatn), sans-serif", script: "persian" },
  {
    id: "ibmPlexArabic",
    label: "IBM Plex عربی",
    stack: "var(--font-ibm-plex-arabic), sans-serif",
    script: "persian",
  },
  { id: "notoArabic", label: "نوتو سنس", stack: "var(--font-noto-arabic), sans-serif", script: "persian" },
  { id: "cairo", label: "کایرو", stack: "var(--font-cairo), sans-serif", script: "persian" },
  { id: "montserrat", label: "Montserrat", stack: "var(--font-montserrat), sans-serif", script: "latin" },
  { id: "inter", label: "Inter", stack: "var(--font-inter), sans-serif", script: "latin" },
];

const fontStackById = new Map(fontOptions.map((option) => [option.id, option.stack]));

export function getFontStack(id: FontFamilyId): string {
  return fontStackById.get(id) ?? fontOptions[0].stack;
}
