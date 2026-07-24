/**
 * Exact visual values extracted from the imported design (Resume Editor.dc.html),
 * the pixel-accurate source of truth for this UI. These raw strings are used in
 * inline `style={{ ... }}` on existing components where a Chakra style prop can't
 * express the precise px/hex/rgba/shadow. Chakra-prop styling continues to read
 * the mirrored tokens in `lib/chakra/system.ts` (accent ramp + named shadows).
 *
 * Centralising here keeps the accent, shadow stacks, radii and key spacings in
 * one place. Styling only — no behaviour depends on this module.
 *
 * COLOR MODE: every colour/shadow below resolves through the `chrome.*` /
 * named-shadow semantic tokens in `lib/chakra/system.ts`, so the whole chrome
 * follows the app's light/dark mode via CSS variables. Light values are the
 * original design values verbatim. The A4 résumé subtree pins these vars back
 * to light via its `.light` scope, so the page never follows the mode.
 */
const chromeVar = (name: string) => `var(--chakra-colors-chrome-${name})`;
const shadowVar = (name: string) => `var(--chakra-shadows-${name})`;

export const COLORS = {
  // App/chrome accent (Chakra `gray`). This mirrors the Chakra `accent`
  // semantic palette in `lib/chakra/system.ts` (the canonical swap point) for
  // the few inline styles that can't use a Chakra prop. accent = gray.600,
  // accentHover = gray.700, accentTint = gray.600 @ 10%.
  accent: chromeVar("accent"),
  accentHover: chromeVar("accent-hover"),
  accentTint: chromeVar("accent-tint"),
  ink: chromeVar("ink"),
  ink700: chromeVar("ink-700"),
  ink600: chromeVar("ink-600"),
  ink500: chromeVar("ink-500"),
  muted: chromeVar("muted"),
  faint: chromeVar("faint"),
  track: chromeVar("track"),
  activeTab: chromeVar("active-tab"),
  workspace: chromeVar("workspace"),
  // True white — mode-invariant (surfaces that must stay white use this).
  white: "#ffffff",
  saveGreen: chromeVar("save-green"),
  deleteBg: chromeVar("delete-bg"),
  deleteFg: chromeVar("delete-fg"),
  line06: chromeVar("line-06"),
  line07: chromeVar("line-07"),
  line08: chromeVar("line-08"),
} as const;

export const SHADOWS = {
  rail: shadowVar("rail"),
  railHover: shadowVar("rail-hover"),
  toolbar: shadowVar("toolbar"),
  page: shadowVar("page"),
  panel: shadowVar("panel"),
  card: shadowVar("card"),
  cardSoft: shadowVar("card-soft"),
  cardFaint: shadowVar("card-faint"),
  cardHover: shadowVar("card-hover"),
  thumb: shadowVar("thumb"),
  ring: shadowVar("ring"),
  hairlineRing: shadowVar("hairline-ring"),
  badge: shadowVar("badge"),
  avatarInset: shadowVar("avatar-inset"),
  photoInset: shadowVar("photo-inset"),
  swatchInnerRing: shadowVar("swatch-inner-ring"),
  knob: shadowVar("knob"),
  dotRing: shadowVar("dot-ring"),
} as const;

export const RADII = {
  pill: "15px",
  tab: "9px",
  panel: "10px",
  card: "8px",
  control: "6px",
  chipDelete: "4px",
  full: "9999px",
} as const;

/**
 * Topbar "Dock" — the geometry (sizes, radii, glass, shadow stacks) is a faithful
 * port of the imported "Topbar Dock" design, but every colour is mapped onto the
 * app's existing zinc/gray chrome tokens above (NOT the design's slate ramp), so
 * the dock stays inside the app's colour system. Three floating glass clusters:
 * the panel toggle (RTL start), the centered icon-only tool dock, and the
 * save + avatar cluster (RTL end).
 */
export const DOCK = {
  // Frosted-white clusters floating over the workspace.
  glassBg: chromeVar("glass"),
  // Solid raised surface a glass cluster lifts to on hover.
  glassSolid: chromeVar("glass-solid"),
  blur: "blur(12px)",
  border: COLORS.line07,
  borderStrong: COLORS.line08,
  divider: COLORS.line08,
  // Tool states — app zinc chrome (active = near-black ink pill).
  activeBg: COLORS.ink,
  activeFg: chromeVar("on-ink"),
  idleFg: COLORS.ink600,
  hoverBg: COLORS.line06,
  hoverFg: COLORS.ink,
  // Save + avatar.
  saveGreen: COLORS.saveGreen,
  saveGreenTrack: chromeVar("save-green-track"),
  spinner: COLORS.ink500,
  spinnerTrack: chromeVar("spinner-track"),
  avatarBg: COLORS.track,
  avatarFg: COLORS.ink500,
} as const;

/**
 * Dock shadow stacks (design geometry, app-neutral black tint). Kept deliberately
 * FAINT — the dock clusters float on a near-white workspace, so a soft, low-opacity
 * lift reads cleaner than a heavy drop while still detaching them from the page.
 */
export const DOCK_SHADOWS = {
  center: shadowVar("dock-center"),
  side: shadowVar("dock-side"),
} as const;

/** Dock corner radii, ported 1:1 from the design. */
export const DOCK_RADII = {
  toggle: "14px",
  center: "19px",
  save: "15px",
  tool: "13px",
  saveBtn: "11px",
} as const;

/** Hatched "advertising space" placeholder fill used in every side panel. */
export const AD_HATCH = `repeating-linear-gradient(135deg, ${chromeVar("hatch-a")}, ${chromeVar("hatch-a")} 8px, ${chromeVar("hatch-b")} 8px, ${chromeVar("hatch-b")} 16px)`;
