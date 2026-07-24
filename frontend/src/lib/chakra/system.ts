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

/**
 * Reference a step of the chosen accent palette's ramp per color mode: the
 * light-mode step and the (usually mirrored) dark-mode step.
 */
const accentStep = (lightStep: number, darkStep: number) => ({
  value: {
    _light: `{colors.${APP_ACCENT_PALETTE}.${lightStep}}`,
    _dark: `{colors.${APP_ACCENT_PALETTE}.${darkStep}}`,
  },
});

/**
 * A light/dark semantic pair. Dark values are resolved by Chakra's `.dark`
 * class scope (next-themes sets it on <html> in the editor app); the A4 résumé
 * subtree opts back out via a `.light` class on the page root, so these pairs
 * NEVER change the résumé itself.
 */
const mode = (light: string, dark: string) => ({
  value: { _light: light, _dark: dark },
});

/**
 * The dark chrome base (#060709) and the surface/text ramp derived from it.
 * Used by the `bg.*` overrides and the `chrome.*` tokens below.
 */
const DARK = {
  base: "#060709",
  subtle: "#0c0d10",
  panel: "#101114",
  muted: "#17181c",
  activeTab: "#1d1e23",
  emphasized: "#212227",
  track: "#26272c",
} as const;

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
    },
    semanticTokens: {
      shadows: {
        // Layered: hairline ring + soft lift (never a single heavy drop). Dark
        // variants swap the black hairlines for white-alpha rings (a black ring
        // is invisible on the #060709 chrome) and deepen the drops.
        rail: {
          value: {
            _light: "0 0 0 1px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.08)",
            _dark: "0 0 0 1px rgba(255,255,255,0.09), 0 1px 3px rgba(0,0,0,0.55)",
          },
        },
        railHover: {
          value: {
            _light: "0 0 0 1px rgba(113,113,122,0.45), 0 2px 6px rgba(0,0,0,0.10)",
            _dark: "0 0 0 1px rgba(154,155,163,0.45), 0 2px 6px rgba(0,0,0,0.55)",
          },
        },
        toolbar: {
          value: {
            _light: "0 0 0 1px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.06)",
            _dark: "0 0 0 1px rgba(255,255,255,0.07), 0 4px 16px rgba(0,0,0,0.45)",
          },
        },
        panel: {
          value: {
            _light:
              "0 0 0 1px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.06)",
            _dark:
              "0 0 0 1px rgba(255,255,255,0.08), 0 4px 16px rgba(0,0,0,0.5), 0 12px 32px rgba(0,0,0,0.4)",
          },
        },
        page: {
          value: {
            _light:
              "0 0 0 1px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.08)",
            _dark:
              "0 0 0 1px rgba(255,255,255,0.10), 0 1px 2px rgba(0,0,0,0.5), 0 12px 32px rgba(0,0,0,0.55)",
          },
        },
        card: {
          value: {
            _light: "inset 0 0 0 1px rgba(0,0,0,0.08)",
            _dark: "inset 0 0 0 1px rgba(255,255,255,0.10)",
          },
        },
        cardSoft: {
          value: {
            _light: "inset 0 0 0 1px rgba(0,0,0,0.07)",
            _dark: "inset 0 0 0 1px rgba(255,255,255,0.09)",
          },
        },
        cardFaint: {
          value: {
            _light: "inset 0 0 0 1px rgba(0,0,0,0.06)",
            _dark: "inset 0 0 0 1px rgba(255,255,255,0.08)",
          },
        },
        cardHover: {
          value: {
            _light: "inset 0 0 0 1px rgba(113,113,122,0.60)",
            _dark: "inset 0 0 0 1px rgba(154,155,163,0.60)",
          },
        },
        thumb: {
          value: {
            _light: "0 0 0 1px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.25)",
            _dark: "0 0 0 1px rgba(255,255,255,0.16), 0 1px 3px rgba(0,0,0,0.6)",
          },
        },
        // Selected swatch/background/template ring: accent halo + soft lift.
        ring: {
          value: {
            _light: "0 0 0 2px #71717a, 0 4px 12px rgba(113,113,122,0.25)",
            _dark: "0 0 0 2px #9a9ba3, 0 4px 12px rgba(0,0,0,0.5)",
          },
        },
        hairlineRing: {
          value: {
            _light: "0 0 0 1px rgba(0,0,0,0.08)",
            _dark: "0 0 0 1px rgba(255,255,255,0.10)",
          },
        },
        badge: {
          value: {
            _light: "0 1px 3px rgba(0,0,0,0.2)",
            _dark: "0 1px 3px rgba(0,0,0,0.6)",
          },
        },
        avatarInset: {
          value: {
            _light: "inset 0 0 0 1px rgba(0,0,0,0.08)",
            _dark: "inset 0 0 0 1px rgba(255,255,255,0.10)",
          },
        },
        photoInset: {
          value: {
            _light: "inset 0 0 0 1px rgba(0,0,0,0.06)",
            _dark: "inset 0 0 0 1px rgba(255,255,255,0.08)",
          },
        },
        // Reads on the coloured swatch itself, so the same in both modes.
        swatchInnerRing: {
          value:
            "inset 0 0 0 2.5px rgba(255,255,255,0.85), inset 0 0 0 3.5px rgba(0,0,0,0.22)",
        },
        knob: {
          value: {
            _light: "0 1px 2px rgba(0,0,0,0.3)",
            _dark: "0 1px 2px rgba(0,0,0,0.6)",
          },
        },
        // Ring colour matches the surface the dot sits on (panel bg).
        dotRing: {
          value: { _light: "0 0 0 3px #fff", _dark: `0 0 0 3px ${DARK.panel}` },
        },
        // Dock cluster lifts (design geometry, app-neutral black tint).
        dockCenter: {
          value: {
            _light: "0 6px 16px -12px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.03)",
            _dark: "0 6px 16px -12px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.35)",
          },
        },
        dockSide: {
          value: {
            _light: "0 4px 12px -10px rgba(0,0,0,0.09), 0 1px 2px rgba(0,0,0,0.03)",
            _dark: "0 4px 12px -10px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.35)",
          },
        },
      },
      colors: {
        // App chrome surfaces, rebuilt around the #060709 dark base. Light
        // values keep Chakra's defaults so light mode is unchanged.
        bg: {
          DEFAULT: mode("{colors.white}", DARK.base),
          subtle: mode("{colors.gray.50}", DARK.subtle),
          muted: mode("{colors.gray.100}", DARK.muted),
          emphasized: mode("{colors.gray.200}", DARK.emphasized),
          panel: mode("{colors.white}", DARK.panel),
        },
        // The app/chrome accent. Mirrors the chosen built-in palette
        // (APP_ACCENT_PALETTE) so `colorPalette="accent"` behaves exactly like
        // that palette while staying swappable from a single constant.
        accent: {
          solid: accentStep(600, 400),
          contrast: { value: { _light: "white", _dark: "black" } },
          fg: accentStep(700, 300),
          muted: accentStep(200, 800),
          subtle: accentStep(100, 900),
          emphasized: accentStep(300, 700),
          focusRing: accentStep(500, 500),
          border: accentStep(500, 600),
        },
        // Error/danger palette — a 1:1 mirror of Chakra's built-in `red` ramp so
        // `colorPalette="error"` renders a solid red fill (error.solid = red.600
        // in BOTH modes) with a white contrast label. White on #dc2626 clears AA
        // (~4.8:1), so the Download button's blocked-attempt state stays legible
        // in light and dark alike. Named `error` (not `red`) to read as intent.
        error: {
          solid: { value: { _light: "{colors.red.600}", _dark: "{colors.red.600}" } },
          contrast: { value: { _light: "white", _dark: "white" } },
          fg: { value: { _light: "{colors.red.700}", _dark: "{colors.red.300}" } },
          muted: { value: { _light: "{colors.red.200}", _dark: "{colors.red.800}" } },
          subtle: { value: { _light: "{colors.red.100}", _dark: "{colors.red.900}" } },
          emphasized: { value: { _light: "{colors.red.300}", _dark: "{colors.red.700}" } },
          focusRing: { value: { _light: "{colors.red.500}", _dark: "{colors.red.500}" } },
          border: { value: { _light: "{colors.red.500}", _dark: "{colors.red.400}" } },
        },
        // Mode-aware twins of the raw chrome values in `lib/design/tokens.ts`;
        // that module now points at these vars so every inline style follows
        // the color mode without per-component changes.
        chrome: {
          accent: mode("#52525b", "#b9bac1"),
          accentHover: mode("#3f3f46", "#d4d4d9"),
          accentTint: mode("rgba(82,82,91,0.10)", "rgba(185,186,193,0.14)"),
          ink: mode("#18181b", "#ececef"),
          ink700: mode("#3f3f46", "#d4d4d9"),
          ink600: mode("#52525b", "#b9bac1"),
          ink500: mode("#71717a", "#9a9ba3"),
          muted: mode("#a1a1aa", "#7d7e86"),
          faint: mode("#c4c4cc", "#55565e"),
          track: mode("#e4e4e7", DARK.track),
          activeTab: mode("#f1f1f4", DARK.activeTab),
          workspace: mode("#f4f4f5", DARK.base),
          // Text on the inverted "ink" pill (near-black in light, light in dark).
          onInk: mode("#ffffff", DARK.base),
          glass: mode("rgba(255,255,255,0.92)", "rgba(16,17,20,0.88)"),
          glassSolid: mode("#ffffff", DARK.activeTab),
          saveGreen: mode("#16a34a", "#4ade80"),
          saveGreenTrack: mode("rgba(22,163,74,0.28)", "rgba(74,222,128,0.30)"),
          spinnerTrack: mode("rgba(113,113,122,0.25)", "rgba(154,155,163,0.25)"),
          deleteBg: mode("#fee2e2", "#421417"),
          deleteFg: mode("#dc2626", "#f87171"),
          line06: mode("rgba(0,0,0,0.06)", "rgba(255,255,255,0.07)"),
          line07: mode("rgba(0,0,0,0.07)", "rgba(255,255,255,0.08)"),
          line08: mode("rgba(0,0,0,0.08)", "rgba(255,255,255,0.09)"),
          hatchA: mode("#fafafa", DARK.subtle),
          hatchB: mode("#f4f4f5", "#15161a"),
        },
      },
    },
  },
});

export const chakraSystem = createSystem(defaultConfig, config);
