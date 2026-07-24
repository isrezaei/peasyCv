import type { MetadataRoute } from "next";
import { absoluteUrl, site } from "@/lib/site";

/**
 * Allow crawling of the whole marketing site and point at the sitemap. Nothing
 * that should rank is disallowed. The studio app is a separate host with its own
 * noindex (§7) — it simply never appears in this sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: site.url,
  };
}
