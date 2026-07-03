/**
 * Exact visual values extracted from the imported design (Resume Editor.dc.html),
 * the pixel-accurate source of truth for this UI. These raw strings are used in
 * inline `style={{ ... }}` on existing components where a Chakra style prop can't
 * express the precise px/hex/rgba/shadow. Chakra-prop styling continues to read
 * the mirrored tokens in `lib/chakra/system.ts` (accent ramp + named shadows).
 *
 * Centralising here keeps the accent, shadow stacks, radii and key spacings in
 * one place. Styling only — no behaviour depends on this module.
 */
export const COLORS = {
  // App/chrome accent (Chakra `gray`). This mirrors the Chakra `accent`
  // semantic palette in `lib/chakra/system.ts` (the canonical swap point) for
  // the few inline styles that can't use a Chakra prop. accent = gray.600,
  // accentHover = gray.700, accentTint = gray.600 @ 10%.
  accent: "#52525b",
  accentHover: "#3f3f46",
  accentTint: "rgba(82,82,91,0.10)",
  ink: "#18181b",
  ink700: "#3f3f46",
  ink600: "#52525b",
  ink500: "#71717a",
  muted: "#a1a1aa",
  faint: "#c4c4cc",
  track: "#e4e4e7",
  activeTab: "#f1f1f4",
  workspace: "#f4f4f5",
  white: "#ffffff",
  saveGreen: "#16a34a",
  deleteBg: "#fee2e2",
  deleteFg: "#dc2626",
  line06: "rgba(0,0,0,0.06)",
  line07: "rgba(0,0,0,0.07)",
  line08: "rgba(0,0,0,0.08)",
} as const;

export const SHADOWS = {
  rail: "0 0 0 1px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.08)",
  railHover: "0 0 0 1px rgba(113,113,122,0.45), 0 2px 6px rgba(0,0,0,0.10)",
  toolbar: "0 0 0 1px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.06)",
  page: "0 0 0 1px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.08)",
  panel: "0 0 0 1px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.06)",
  card: "inset 0 0 0 1px rgba(0,0,0,0.08)",
  cardSoft: "inset 0 0 0 1px rgba(0,0,0,0.07)",
  cardFaint: "inset 0 0 0 1px rgba(0,0,0,0.06)",
  cardHover: "inset 0 0 0 1px rgba(113,113,122,0.60)",
  thumb: "0 0 0 1px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.25)",
  ring: "0 0 0 2px #71717a, 0 4px 12px rgba(113,113,122,0.25)",
  hairlineRing: "0 0 0 1px rgba(0,0,0,0.08)",
  badge: "0 1px 3px rgba(0,0,0,0.2)",
  avatarInset: "inset 0 0 0 1px rgba(0,0,0,0.08)",
  photoInset: "inset 0 0 0 1px rgba(0,0,0,0.06)",
  swatchInnerRing:
    "inset 0 0 0 2.5px rgba(255,255,255,0.85), inset 0 0 0 3.5px rgba(0,0,0,0.22)",
  knob: "0 1px 2px rgba(0,0,0,0.3)",
  dotRing: "0 0 0 3px #fff",
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
  glassBg: "rgba(255,255,255,0.92)",
  blur: "blur(12px)",
  border: COLORS.line07,
  borderStrong: COLORS.line08,
  divider: COLORS.line08,
  // Tool states — app zinc chrome (active = near-black ink pill).
  activeBg: COLORS.ink,
  activeFg: COLORS.white,
  idleFg: COLORS.ink600,
  hoverBg: COLORS.line06,
  hoverFg: COLORS.ink,
  // Save + avatar.
  saveGreen: COLORS.saveGreen,
  saveGreenTrack: "rgba(22,163,74,0.28)",
  spinner: COLORS.ink500,
  spinnerTrack: "rgba(113,113,122,0.25)",
  avatarBg: COLORS.track,
  avatarFg: COLORS.ink500,
} as const;

/**
 * Dock shadow stacks (design geometry, app-neutral black tint). Kept deliberately
 * FAINT — the dock clusters float on a near-white workspace, so a soft, low-opacity
 * lift reads cleaner than a heavy drop while still detaching them from the page.
 */
export const DOCK_SHADOWS = {
  center: "0 6px 16px -12px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.03)",
  side: "0 4px 12px -10px rgba(0,0,0,0.09), 0 1px 2px rgba(0,0,0,0.03)",
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
export const AD_HATCH =
  "repeating-linear-gradient(135deg, #fafafa, #fafafa 8px, #f4f4f5 8px, #f4f4f5 16px)";
