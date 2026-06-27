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
const APP_ACCENT_PALETTE = "gray";

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

    // Project-wide: NO visible scrollbars anywhere. Scrolling still works on every
    // scroll container (overflow:auto regions keep their wheel/touch/keyboard
    // scroll) — only the bar chrome is removed. Firefox hides via the non-inherited
    // `scrollbar-width:none` (so it's set on `*`, not just the root); WebKit/Blink
    // collapse the bar (and any arrow/stepper buttons) via the pseudo-elements.
    html: { scrollbarWidth: "none" },
    "*": { scrollbarWidth: "none" },
    "::-webkit-scrollbar": { display: "none", width: "0", height: "0" },
    "::-webkit-scrollbar-button": { display: "none", width: "0", height: "0" },
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
          value: "0 0 0 1px rgba(113,113,122,0.45), 0 2px 6px rgba(0,0,0,0.10)",
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
          value: "inset 0 0 0 1px rgba(113,113,122,0.60)",
        },
        // Selected swatch/background/template ring: accent halo + soft lift.
        ring: {
          value: "0 0 0 2px #71717a, 0 4px 12px rgba(113,113,122,0.25)",
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
