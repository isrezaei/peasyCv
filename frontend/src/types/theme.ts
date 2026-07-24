export type ThemeId =
  | "sage"
  | "lavender"
  | "skyBlue"
  | "dustyRose"
  | "mint"
  | "softCoral"
  | "peach"
  | "ocean"
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

/** Profile photo corner shape: full circle, rounded (lg) corners, or sharp (no rounding). */
export type PhotoStyle = "round" | "square" | "sharp";

/** Which physical side the personal-info photo sits on in the inline header. */
export type ImageSide = "left" | "right";

/**
 * Which calendar system every resume date is *rendered* in. Dates are always
 * stored canonically as ISO (Gregorian) in the content data; this is a pure
 * presentation choice that lives in the theme/design state so it round-trips
 * into the PDF pipeline alongside the other look-and-feel settings.
 */
export type CalendarSystem = "jalali" | "hijri" | "gregorian";

/**
 * Width preset for the coloured side column of the column templates ("Column
 * Layout" in the design panel). "medium" is each template's original width;
 * the other steps widen/narrow it by a fixed millimetre offset (see
 * `COLUMN_WIDTH_DELTA_MM` in the pagination constants). Even at "xlarge" the
 * main column always stays wider than the coloured column. Pure presentation
 * with a pagination consequence: the column-flow metrics mirror the resolved
 * width (see `useColumnLayout`).
 */
export type ColumnWidthId = "small" | "medium" | "large" | "xlarge";

export interface ThemeSettings {
  themeId: ThemeId;
  /**
   * DEAD FIELD — retained for back-compat, do not read. The A4 page is now
   * ALWAYS white in every surface (editor, /print, /share, PDF); the templates
   * hard-code `#FFFFFF` and ignore this value. It is kept on the type / DTO /
   * DB column ONLY so résumés saved before the colored-page option was removed
   * still load and validate (no 400). Safe to drop in a future cleanup once no
   * stored document carries it. Was: "theme" (tinted page) vs "white".
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
   * Resume-wide toggle: when on, every section heading shows its section icon in
   * a rounded, lightly-tinted marker chip. Off by default so existing résumés look
   * unchanged unless the user enables it from the design panel. Pure presentation.
   */
  showSectionIcons: boolean;
  /**
   * Resume-wide toggle: when on, a very thin hairline separator is drawn beneath
   * every section title, tinted from the theme's marker seam on light surfaces and
   * a light white-alpha on dark ones. Off by default so existing résumés look
   * unchanged unless the user enables it from the design panel. Pure presentation
   * — the line is overlaid in the title-row gap, so section heights (and the
   * pagination estimates) are untouched.
   */
  showSectionSeparators: boolean;
  /**
   * Intensity multiplier for the COLOURED column of the multi-column templates
   * (the tinted sidebar / dark aside / photo aside / timeline panel). 1 keeps each
   * template's original tint; below 1 lightens it, above 1 strengthens it. Values
   * above the 1.05 threshold hard-switch the tinted columns into a dark shade with
   * on-dark typography (see `columnTint` in resolveTheme.ts). Pure presentation,
   * so it lives here and round-trips into the PDF render. 0.5 – 2.
   */
  columnIntensity: number;
  /**
   * Width preset of the coloured side column in the column templates. Default
   * "medium" keeps each template's original width byte-identical; the other
   * presets step the column narrower or wider. See {@link ColumnWidthId}.
   */
  columnWidth: ColumnWidthId;
  /**
   * ATS Friendly mode. When on, the résumé renders as a single-column,
   * decoration-free, plain-black-on-white document regardless of the selected
   * template, and the print/PDF surface emits real text nodes instead of the
   * editor's form controls — so applicant-tracking systems can extract the
   * content. Default false; existing résumés are untouched until they opt in.
   */
  atsMode: boolean;
}

export interface ThemePreset {
  id: ThemeId;
  label: string;
  base: string;
  soft: string;
  accentDark: string;
  contrastText: string;
}
