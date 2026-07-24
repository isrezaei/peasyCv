import type { Metadata } from "next";
import { absoluteUrl, site } from "@/lib/site";

type PageMetaInput = {
  /** Page-specific title (without the brand suffix — the template adds it). */
  title: string;
  /** Unique, benefit-led description, ~150–160 chars. Never reused across pages. */
  description: string;
  /** Site-relative path — used for the self-referencing canonical + OG url. */
  path: string;
  /** Override the default per-route OG image (defaults to the route's own og). */
  ogImage?: string;
  /** Article-specific Open Graph fields for blog posts. */
  article?: {
    publishedTime: string;
    modifiedTime: string;
    authors: string[];
    tags?: string[];
  };
};

/**
 * Builds a complete, SEO-correct Metadata object for a page: unique title +
 * description, a self-referencing canonical, and Open Graph / Twitter cards.
 * The root layout supplies metadataBase + the title template, so `title` here
 * is just the page part.
 */
export function pageMetadata({
  title,
  description,
  path,
  ogImage,
  article,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const images = ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: article ? "article" : "website",
      url,
      title: `${title} | ${site.nameFa}`,
      description,
      siteName: site.name,
      locale: site.locale,
      ...(images ? { images } : {}),
      ...(article
        ? {
            publishedTime: article.publishedTime,
            modifiedTime: article.modifiedTime,
            authors: article.authors,
            tags: article.tags,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${site.nameFa}`,
      description,
      ...(images ? { images } : {}),
    },
    robots: { index: true, follow: true },
  };
}
