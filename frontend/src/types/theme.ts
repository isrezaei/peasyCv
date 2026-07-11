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
  | "grey"
  | "indigo"
  | "navyGold"
  | "crimsonCopper"
  | "violetOrange"
  | "midnightMint"
  | "azurePeach"
  | "charcoalLemon"
  | "charcoalAmber"
  | "smokyCoral"
  | "charcoalJade"
  | "purpleRose"
  | "inkFuchsia"
  | "graphiteGold"
  | "greenBlue"
  | "pinky"

export type PageBackgroundMode = "theme" | "white";

export type BackgroundPatternId =
  | "none"
  | "blobs"
  | "botanical"
  | "bracketsRings"
  | "chevronField"
  | "concentricArcs"
  | "dotGrid"
  | "topoLines";

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
  /**
   * Whether the A4 page is painted with the theme tint ("theme") or kept plain
   * white ("white"). Independent of {@link backgroundPattern} — every
   * combination of page colour and decorative pattern is valid.
   */
  pageBackground: PageBackgroundMode;
  backgroundPattern: BackgroundPatternId;
  /**
   * Overall opacity multiplier for the decorative pattern (0.10 – 1.25). It
   * scales every motif element uniformly — preserving each pattern's internal
   * opacity relationships — so the user can dial the background lighter or
   * stronger. The light/faint end is deliberately wide (down to 0.10) so the
   * pattern can be made very subtle; the default sits low (0.7 — soft,
   * readability-safe pastel) and it round-trips into the PDF render identically.
   * See {@link BackgroundLayer}.
   */
  backgroundIntensity: number;
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
  /**
   * Intensity multiplier for the COLOURED column of the multi-column templates
   * (the tinted sidebar / dark aside / photo aside / timeline panel). 1 keeps each
   * template's original tint; below 1 lightens it, above 1 strengthens it. Pure
   * presentation, so it lives here and round-trips into the PDF render. 0.5 – 1.5.
   */
  columnIntensity: number;
}

export interface ThemePreset {
  id: ThemeId;
  label: string;
  base: string;
  soft: string;
  accentDark: string;
  contrastText: string;
}
