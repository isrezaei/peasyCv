import localFont from "next/font/local";

/**
 * Vazirmatn — the site's single Persian-first typeface, self-hosted via
 * next/font/local (never a third-party CDN, which would cost a DNS+TLS round
 * trip and hurt LCP). One variable woff2 covers the whole 100–900 weight range,
 * so we ship one file and get every weight. `display: swap` + preload keep text
 * visible during load; the static TTFs in /fonts are used only by the OG image
 * renderer (satori can't consume a variable woff2). See src/app/globals.css for
 * the `--font-sans` wiring and the Latin fallback stack.
 */
export const vazirmatn = localFont({
  src: "../../fonts/Vazirmatn[wght].woff2",
  variable: "--font-vazirmatn",
  display: "swap",
  preload: true,
  weight: "100 900",
  // Persian text must never fall back to a Latin-only face mid-word; the system
  // Arabic-capable fallbacks keep the connected script intact before swap.
  fallback: ["Tahoma", "Arial", "sans-serif"],
});
