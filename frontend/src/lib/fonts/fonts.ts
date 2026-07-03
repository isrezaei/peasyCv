import {
  Cairo,
  IBM_Plex_Sans_Arabic,
  Inter,
  Montserrat,
  Noto_Sans_Arabic,
  Vazirmatn,
} from "next/font/google";
import localFont from "next/font/local";

/**
 * Kalameh is the project-wide UI typeface (Persian + Latin chrome). It is the
 * single local font bundled at the repo root and self-hosted via next/font, so
 * its `--font-kalameh` variable drives the Chakra `body`/`heading` font tokens
 * and the global `body` font-family. The `src` path is resolved relative to
 * this file. (The resume document keeps its own user-selectable font system —
 * see `lib/fonts/registry.ts` — which is intentionally independent of this.)
 */
export const kalameh = localFont({
  src: "../../../fonts/Kalameh-Regular.ttf",
  variable: "--font-kalameh",
  weight: "400",
  display: "swap",
});

export const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const notoArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  display: "swap",
});

export const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/** Space-separated list of every font CSS variable, applied once on <html>. */
export const fontVariables = [
  kalameh.variable,
  vazirmatn.variable,
  ibmPlexArabic.variable,
  notoArabic.variable,
  cairo.variable,
  montserrat.variable,
  inter.variable,
].join(" ");
