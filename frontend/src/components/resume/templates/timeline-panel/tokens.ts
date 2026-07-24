/**
 * Structural tokens of قالب ۳ — "timeline-panel", read verbatim off the imported
 * design (`Resume.dc.html`, Claude Design project 7d8d659d).
 *
 * UNIT POLICY (the same one {@link HeaderBand} follows):
 *   • An A4 sheet is ~794px wide at 96dpi in BOTH the reference and this app, so
 *     the reference's px map 1:1 onto the A4 surface.
 *   • TYPE is expressed in em of the page's 15px base, so it tracks the font-size
 *     slider while staying pixel-exact at scale 1.0.
 *   • STRUCTURAL CHROME (rail widths, marker sizes, card radius/padding, photo)
 *     stays in fixed px — it is geometry, not scalable text — exactly as the
 *     reference authors it, and print-safe (px/mm resolve identically on screen
 *     and in the PDF; no vw/vh/rem-of-root anywhere).
 */

/** Reference px → mm (1:1 A4 mapping, see the unit policy above). */
export const pxToMm = (px: number): number => (px * 25.4) / 96;
/** Reference px → em of the page's 15px base. */
export const pxToEm = (px: number): string => `${(px / 15).toFixed(4)}em`;

// ── Page composition ────────────────────────────────────────────────────────
/**
 * Reference VERTICAL page padding — `padding: 24px 28px` on the page-1 frame.
 * This template owns its vertical margin (via the A4Page `bleed` escape and the
 * layout's `verticalMarginMm`), pinning the design's own 24px instead of the
 * shared 16mm lock; the reference's near-full-height panel card depends on it.
 */
export const PAGE_VPAD_PX = 24;
export const PAGE_VPAD_MM = pxToMm(PAGE_VPAD_PX);

/** Panel share of the content box — reference `width: 30%` on the left column. */
export const PANEL_FRACTION = 0.3;
/** Panel ↔ main gutter — reference `gap: 24px`. */
export const GUTTER_PX = 24;
export const GUTTER_MM = pxToMm(GUTTER_PX);
/** Main column's own top offset on page 1 — reference `padding-top: 30px`. */
export const MAIN_TOP_PX = 30;

// ── Side panel card ─────────────────────────────────────────────────────────
export const PANEL_RADIUS = "15px"; // reference border-radius: 15px
export const PANEL_PAD_TOP_PX = 58; // reference padding-top with the photo overlapping
export const PANEL_PAD_TOP_BARE_PX = 24; // no photo → the card's own bottom pad, mirrored
export const PANEL_PAD_BOTTOM_PX = 24;
export const PANEL_PAD_START_PX = 14; // reference padding-right in its RTL panel
export const PANEL_PAD_END_PX = 16; // reference padding-left in its RTL panel
/** Total inline chrome the panel card takes out of its own width. */
export const PANEL_PAD_INLINE_PX = PANEL_PAD_START_PX + PANEL_PAD_END_PX;

// ── Photo ───────────────────────────────────────────────────────────────────
export const PHOTO_PX = 150; // reference 150 × 150 circle
export const PHOTO_OVERLAP_PX = 40; // reference margin-bottom: -40px onto the card

// ── Timeline geometry ───────────────────────────────────────────────────────
/**
 * One region's rail metrics. `dotTopPx` is the marker's own `margin-top`, so the
 * marker CENTRE — and therefore the rail's start — is `dotTopPx + dotPx / 2`.
 */
export interface RailMetrics {
  /** Rail column width (the marker is centred in it). */
  columnPx: number;
  /** Rail line thickness. */
  linePx: number;
  /** Marker diameter and ring thickness. */
  dotPx: number;
  dotBorderPx: number;
  /** Marker's top offset inside the rail column. */
  dotTopPx: number;
  /** Rail column → section content gap (the reference's `padding-right`). */
  contentPadPx: number;
}

/** Main column — reference: 20px column, 1.5px line, 12px dot, mt 3px, pad 12px. */
export const MAIN_RAIL: RailMetrics = {
  columnPx: 20,
  linePx: 1.5,
  dotPx: 12,
  dotBorderPx: 1.5,
  dotTopPx: 3,
  contentPadPx: 12,
};

/** Side panel — reference: 17px column, 1.5px line, 11px dot, mt 2px, pad 10px. */
export const PANEL_RAIL: RailMetrics = {
  columnPx: 17,
  linePx: 1.5,
  dotPx: 11,
  dotBorderPx: 1.5,
  dotTopPx: 2,
  contentPadPx: 10,
};

/** Vertical centre of a region's marker, measured from the section box top. */
export const dotCentrePx = (rail: RailMetrics): number => rail.dotTopPx + rail.dotPx / 2;
/** Inline chrome a region's rail takes out of the column's text width. */
export const railInsetPx = (rail: RailMetrics): number => rail.columnPx + rail.contentPadPx;

// ── Typography (reference px → em of the 15px page base) ────────────────────
/**
 * Main section heading. The reference's own 19px read markedly larger than the
 * app's other templates' section titles; at the user's request this template's
 * headings now match the SHARED section-title size (1.04em = 15.6px), so «تجربهٔ
 * کاری» sits at the same scale as every other template's «تجربهٔ کاری». Weight
 * and tracking keep the design's bolder, slightly-tracked cut.
 */
export const MAIN_TITLE_PX = 15.6;
export const MAIN_TITLE_FS = pxToEm(MAIN_TITLE_PX);
export const MAIN_TITLE_WEIGHT = "800";
export const MAIN_TITLE_TRACKING = "0.03em";

/** Panel section heading — reference 14px / 800 / +0.02em. Already well under
 *  the shared size, and it renders inside the panel's own scaled card, so it
 *  stays as the design authored it (the oversize heading was the main one). */
export const PANEL_TITLE_PX = 14;
export const PANEL_TITLE_FS = pxToEm(PANEL_TITLE_PX);
export const PANEL_TITLE_WEIGHT = "800";
export const PANEL_TITLE_TRACKING = "0.02em";

/**
 * What the PAGINATION reserves for each heading. Deliberately a hair above the
 * painted em — the shared scale carries the same +0.04 bias (paints 1.04em,
 * reserves 1.08em) — so a rounding difference can only over-reserve.
 */
export const MAIN_TITLE_ESTIMATE_EM = MAIN_TITLE_PX / 15 + 0.04;
export const PANEL_TITLE_ESTIMATE_EM = PANEL_TITLE_PX / 15 + 0.04;

/**
 * Name. The reference's 44px display size read far too large in the app; at the
 * user's request it drops several steps to 30px (2.0em), sitting just above the
 * app's generic 1.85em name so it still reads as this template's display header
 * without dominating the page. 900 weight / 1.04 line-height / no tracking kept.
 */
export const NAME_PX = 30;
export const NAME_FS = pxToEm(NAME_PX);
export const NAME_LINE_HEIGHT = 1.04;
/** Job title — reference 16px / 600 / +0.14em, 7px under the name. */
export const JOB_TITLE_PX = 16;
export const JOB_TITLE_FS = pxToEm(JOB_TITLE_PX);
export const JOB_TITLE_WEIGHT = "600";
export const JOB_TITLE_TRACKING = "0.14em";
export const NAME_TO_TITLE_PX = 7;

/**
 * PROSE line-heights the reference specifies per tier. These are TYPE, so they
 * come from the design (the project's design-import policy: structure, spacing
 * and type follow the reference; only colour comes from the app). Pinning them
 * means this template's prose does not track the theme's line-height slider —
 * the one place the slider is inert, and the estimator prices these same values
 * (see LayoutMetrics.proseLineHeights) so paint and reserve stay in lockstep.
 */
export const ABOUT_LINE_HEIGHT = 1.85; // reference `line-height: 1.85` on the about <p>
export const BODY_LINE_HEIGHT = 1.6; // reference bullets + project descriptions
export const ACHIEVEMENT_LINE_HEIGHT = 1.7; // reference «دستاوردهای کلیدی» rows

/** Panel contacts — reference 11.5px text, 13px glyphs, 8px glyph gap, 9px rows. */
export const CONTACT_PX = 11.5;
export const CONTACT_FS = pxToEm(CONTACT_PX);
export const CONTACT_ICON_FS = pxToEm(13);
export const CONTACT_ICON_GAP = "8px";
export const CONTACT_ROW_GAP = "9px";
export const CONTACT_ROW_GAP_PX = 9;

/**
 * Trailing padding (px) each panel SECTION carries below its last row, so the
 * visible whitespace between one panel section and the next reads as one uniform
 * rhythm. The section item blocks already sit on ~6px of bottom padding
 * (education `pb=1.5`, the stacked language cell `p=1.5`); the contacts block
 * carried none, so its gap to the first section came up ~1.5mm tighter than the
 * others. Applying the same value below the contacts list evens the column out.
 * Mirrored into the page-1 side reserve (see headerReservePx) so paint and
 * pagination agree.
 */
export const PANEL_SECTION_TRAILING_PX = 6;

// ── Colour band of the panel wash ───────────────────────────────────────────
/**
 * White amount mixed into the theme's mid-tone for the panel fill at column
 * intensity 1. Chosen so the wash lands in the reference's own lightness band
 * (`#dacbba`, relative luminance ≈ 0.61) rather than the near-white washes the
 * other templates use — the design's panel is a present, mid-light tint.
 */
export const PANEL_TINT_WHITE_MIX = 0.25;
/**
 * Hard floor on the panel fill's relative luminance. The A4 surface must stay
 * LIGHT in every theme and at every column intensity — a colour theme may only
 * recolour the wash, never turn it into a dark fill — so a saturated palette is
 * lifted toward white until it clears this. Set just under the reference's own
 * 0.61 so no palette can read darker than the design does.
 */
export const PANEL_MIN_LUMINANCE = 0.58;
/**
 * How much deeper than the panel wash the MAIN column's rail sits — the
 * reference's `#C4B098` rail against its `#dacbba` panel, so the two read as one
 * coordinated palette. Floored at a 2:1 contrast on white (the reference rail
 * measures 2.12:1) so the line never fades out under a very light wash.
 */
export const MAIN_RAIL_DARKEN = 0.14;
export const MAIN_RAIL_MIN_CONTRAST = 2;

/**
 * How far the panel wash is pulled toward its own perceptual gray. The
 * reference band (`#dacbba`) sits at ~30% saturation — a CALM, low-chroma tint —
 * while a raw palette mid-tone tinted white keeps its full chroma and reads as
 * a heavy saturated block. Applied inside `panelWash` only; the text tiers keep
 * their full accent hue.
 */
export const PANEL_CHROMA_SOFTEN = 0.45;

/** Blend a hex toward its own perceptual gray (luma-preserving desaturation). */
export function softenChroma(hex: string, ratio: number): string {
  const n = hex.replace("#", "");
  const full = n.length === 3 ? n.split("").map((c) => c + c).join("") : n;
  const int = parseInt(full, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  const mix = (c: number) => Math.max(0, Math.min(255, Math.round(c + (luma - c) * ratio)));
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

// ── Panel-driven content scaling ────────────────────────────────────────────
/**
 * The reference panel's outer width: 30% of its 178mm content box. The panel's
 * TEXT scales as `sideMm / this` (one relative factor on the card, so every
 * pinned em inside shrinks/grows in proportion — no per-element numbers),
 * clamped to a print-legibility floor and a modest headroom. Structural chrome
 * (rail px, card radius/padding) stays fixed; the photo scales with the card.
 */
export const REF_SIDE_MM = 53.4;
export const PANEL_SCALE_MIN = 0.85;
export const PANEL_SCALE_MAX = 1.1;
export function panelScaleFor(sideMm: number): number {
  return Math.min(PANEL_SCALE_MAX, Math.max(PANEL_SCALE_MIN, sideMm / REF_SIDE_MM));
}

/**
 * Cap multiplied into the user's background intensity for the pattern INSIDE
 * the panel. The column variant draws many SMALL elements (not a few giant
 * sliced ones), so at the old 0.35 the texture was barely visible; this lifts it
 * to a clearly-legible tone-on-tone while the per-element opacities keep it a
 * texture under the panel's live text, at every slider position.
 */
export const PANEL_PATTERN_OPACITY = 0.85;
