export type ThemeId =
  | "sage"
  | "lavender"
  | "skyBlue"
  | "dustyRose"
  | "mint"
  | "softCoral"
  | "peach"
  | "ocean"
  | "slate"
  | "indigo";

export type PageBackgroundMode = "theme" | "white";

export type BackgroundPatternId =
  | "none"
  | "blobs"
  | "hexLines"
  | "topographic"
  | "halftone"
  | "chevron"
  | "corner-brackets"
  | "rainbow-corner";

export type FontFamilyId =
  | "vazirmatn"
  | "ibmPlexArabic"
  | "notoArabic"
  | "cairo"
  | "montserrat"
  | "inter";

export type PhotoStyle = "round" | "square";

/**
 * Which calendar system every resume date is *rendered* in. Dates are always
 * stored canonically as ISO (Gregorian) in the content data; this is a pure
 * presentation choice that lives in the theme/design state so it round-trips
 * into the PDF pipeline alongside the other look-and-feel settings.
 */
export type CalendarSystem = "jalali" | "hijri" | "gregorian";

export interface ThemeSettings {
  themeId: ThemeId;
  /** Optional custom override color; when set it takes precedence over the preset accent. */
  customColor: string | null;
  /**
   * Whether the A4 page is painted with the theme tint ("theme") or kept plain
   * white ("white"). Independent of {@link backgroundPattern} — every
   * combination of page colour and decorative pattern is valid.
   */
  pageBackground: PageBackgroundMode;
  backgroundPattern: BackgroundPatternId;
  /** Calendar system used to render every resume date (content stays ISO). */
  dateCalendar: CalendarSystem;
  fontFamily: FontFamilyId;
  /** Multiplier applied to base body font size. 0.85 – 1.3. */
  fontScale: number;
  /** Unitless line-height for body content. 1.1 – 2.0. */
  lineHeight: number;
  /** Page inner margin in millimetres. 8 – 24. */
  pageMargin: number;
  /** Vertical gap between sections in millimetres. 2 – 12. */
  sectionSpacing: number;
}

export interface ThemePreset {
  id: ThemeId;
  label: string;
  base: string;
  soft: string;
  accentDark: string;
  contrastText: string;
}
