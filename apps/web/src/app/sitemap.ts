import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { roleSamples } from "@/lib/content/samples";
import { blogPosts } from "@/lib/content/blog";

/**
 * Every indexable marketing route. The studio app (studio.peasycv.ir) is an
 * application, not content, and is deliberately excluded (see §7 + robots.ts).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: {
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/features", priority: 0.9, changeFrequency: "monthly" },
    { path: "/templates", priority: 0.9, changeFrequency: "monthly" },
    { path: "/pricing", priority: 0.8, changeFrequency: "monthly" },
    { path: "/resume-ats", priority: 0.9, changeFrequency: "monthly" },
    { path: "/persian-resume", priority: 0.9, changeFrequency: "monthly" },
    { path: "/english-resume", priority: 0.9, changeFrequency: "monthly" },
    { path: "/resume-templates-persian", priority: 0.8, changeFrequency: "monthly" },
    { path: "/resume-samples", priority: 0.8, changeFrequency: "weekly" },
    { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
    { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
    { path: "/about", priority: 0.5, changeFrequency: "yearly" },
    { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: absoluteUrl(r.path),
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const sampleEntries: MetadataRoute.Sitemap = roleSamples.map((s) => ({
    url: absoluteUrl(`/resume-samples/${s.slug}`),
    lastModified: new Date(s.updated),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: absoluteUrl(`/blog/${p.slug}`),
    lastModified: new Date(p.dateModified),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...sampleEntries, ...blogEntries];
}
