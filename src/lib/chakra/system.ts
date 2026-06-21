import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

/**
 * Single source of truth for the app's visual language: the `accent` virtual
 * color palette (the app/chrome accent), the Kalameh UI font tokens, the modern
 * global scrollbar styling, and the layered shadow stacks used for the floating
 * toolbar, panel, action rail, and the lifted A4 page. Components reference
 * these tokens (e.g. `colorPalette="accent"`, `boxShadow="panel"`) instead of
 * hardcoding values.
 */

/**
 * APP_ACCENT_PALETTE — the ONE place to swap the app/chrome accent color.
 * It names any Chakra v3 built-in palette; the `accent` virtual palette below
 * mirrors that palette's ramp into the semantic slots every Chakra recipe reads
 * (solid / fg / muted / subtle / emphasized / contrast / focusRing / border).
 * So everything that uses `colorPalette="accent"` or `accent.fg` follows
 * whatever is set here. This is the APP color only — it is deliberately kept
 * separate from the user-selectable RESUME document color (see lib/themes).
 */
const APP_ACCENT_PALETTE = "cyan";

/** Reference a step of the chosen accent palette's ramp as a semantic value. */
const accentStep = (step: number) => ({
  value: `{colors.${APP_ACCENT_PALETTE}.${step}}`,
});

const config = defineConfig({
  preflight: false,
  globalCss: {
    // Preflight is off, so bare <button> elements would otherwise keep the UA
    // button border AND the UA button font-family (the Button recipe sets no
    // font-family of its own). Reset both here (base layer) so every button —
    // including the top bar — inherits the project font (Kalameh) from <body>;
    // Chakra's own Button/IconButton recipes set their borders in a higher layer
    // and are unaffected.
    button: { borderWidth: "0", fontFamily: "inherit" },

    // Modern, project-wide scrollbars — thin, rounded thumb, transparent track,
    // no arrow buttons, themed with semantic tokens. Firefox uses the inherited
    // `scrollbar-*` properties (set on the root); WebKit/Blink use the
    // pseudo-elements below, which apply to every scroll container in the app.
    html: {
      scrollbarWidth: "thin",
      scrollbarColor: "{colors.border.emphasized} transparent",
    },
    "::-webkit-scrollbar": { width: "10px", height: "10px" },
    "::-webkit-scrollbar-track": { background: "transparent" },
    "::-webkit-scrollbar-thumb": {
      background: "{colors.border.emphasized}",
      borderRadius: "9999px",
      // Transparent inset border keeps the thumb thin with breathing room.
      border: "3px solid transparent",
      backgroundClip: "padding-box",
    },
    "::-webkit-scrollbar-thumb:hover": { background: "{colors.fg.subtle}" },
    "::-webkit-scrollbar-button": { display: "none", width: "0", height: "0" },
    "::-webkit-scrollbar-corner": { background: "transparent" },
  },
  theme: {
    tokens: {
      fonts: {
        // Project-wide UI font (Kalameh) with Persian/Latin fallbacks.
        heading: { value: "var(--font-kalameh), var(--font-vazirmatn), sans-serif" },
        body: { value: "var(--font-kalameh), var(--font-vazirmatn), sans-serif" },
      },
      shadows: {
        // Layered: hairline ring + soft lift (never a single heavy drop).
        rail: {
          value: "0 0 0 1px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.08)",
        },
        railHover: {
          value: "0 0 0 1px rgba(6,182,212,0.40), 0 2px 6px rgba(0,0,0,0.10)",
        },
        toolbar: {
          value: "0 0 0 1px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.06)",
        },
        panel: {
          value:
            "0 0 0 1px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.06)",
        },
        page: {
          value:
            "0 0 0 1px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.08)",
        },
        card: {
          value: "inset 0 0 0 1px rgba(0,0,0,0.08)",
        },
        cardHover: {
          value: "inset 0 0 0 1px rgba(6,182,212,0.55)",
        },
        // Selected swatch/background/template ring: accent halo + soft lift.
        ring: {
          value: "0 0 0 2px #06b6d4, 0 4px 12px rgba(6,182,212,0.22)",
        },
      },
    },
    semanticTokens: {
      colors: {
        // The app/chrome accent. Mirrors the chosen built-in palette
        // (APP_ACCENT_PALETTE) so `colorPalette="accent"` behaves exactly like
        // that palette while staying swappable from a single constant.
        accent: {
          solid: accentStep(600),
          contrast: { value: "white" },
          fg: accentStep(700),
          muted: accentStep(200),
          subtle: accentStep(100),
          emphasized: accentStep(300),
          focusRing: accentStep(500),
          border: accentStep(500),
        },
      },
    },
  },
});

export const chakraSystem = createSystem(defaultConfig, config);
