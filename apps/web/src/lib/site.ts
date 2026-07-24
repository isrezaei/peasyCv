/**
 * Single source of truth for brand + site-wide constants.
 *
 * BRAND POLICY: the Persian rendering of the brand is ONE fixed string
 * everywhere — «پیزی‌سی‌وی» — so search engines learn it as a single token.
 * Never vary it. The Latin brand is always "PeasyCV".
 */
export const site = {
  name: "PeasyCV",
  nameFa: "پیزی‌سی‌وی",
  /** Marketing site origin (this app). */
  url: "https://peasycv.ir",
  /** The résumé editor lives on its own subdomain; every CTA points here. */
  studioUrl: "https://studio.peasycv.ir",
  locale: "fa_IR",
  contactEmail: "hello@peasycv.ir",
  socials: {
    twitter: "https://x.com/peasycv",
    instagram: "https://instagram.com/peasycv",
    linkedin: "https://www.linkedin.com/company/peasycv",
    github: "https://github.com/peasycv",
  },
} as const;

/** Absolute URL for a site-relative path, used for canonicals + sitemap. */
export function absoluteUrl(path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return clean === "/" ? site.url : `${site.url}${clean}`;
}
