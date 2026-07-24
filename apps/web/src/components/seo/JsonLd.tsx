import { absoluteUrl, site } from "@/lib/site";

/**
 * Renders a JSON-LD <script>. JSON.stringify output has its `<` escaped so a
 * stray "</script>" or "<" inside data can never break out of the tag.
 */
function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

const sameAs = Object.values(site.socials);

/** Organization — homepage/global identity. */
export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: site.name,
        alternateName: site.nameFa,
        url: site.url,
        logo: absoluteUrl("/icon.png"),
        description:
          "رزومه‌ساز آنلاین فارسی و راست‌به‌چپ با پیش‌نمایش زنده، قالب‌های حرفه‌ای و خروجی PDF سازگار با ATS.",
        sameAs,
      }}
    />
  );
}

/** WebSite + SearchAction (the site exposes a role sample search entry point). */
export function WebSiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: site.name,
        alternateName: site.nameFa,
        url: site.url,
        inLanguage: "fa-IR",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${site.url}/resume-samples?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

/** SoftwareApplication — the product itself (free web app, Persian). */
export function SoftwareApplicationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: site.name,
        alternateName: site.nameFa,
        url: site.url,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        inLanguage: "fa-IR",
        description:
          "ساخت رزومهٔ فارسی و انگلیسی به‌صورت آنلاین با قالب‌های حرفه‌ای، پیش‌نمایش زنده و خروجی PDF سازگار با ATS.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "IRR",
        },
        featureList: [
          "رزومهٔ فارسی و راست‌به‌چپ",
          "قالب‌های حرفه‌ای",
          "پیش‌نمایش زنده",
          "خروجی PDF",
          "حالت سازگار با ATS",
          "داشبورد چند رزومه‌ای",
        ],
      }}
    />
  );
}

type Crumb = { name: string; path: string };

/** BreadcrumbList — nested pages. */
export function BreadcrumbJsonLd({ items }: { items: Crumb[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.name,
          item: absoluteUrl(c.path),
        })),
      }}
    />
  );
}

type QA = { q: string; a: string };

/** FAQPage — real Q&A blocks. */
export function FaqJsonLd({ items }: { items: QA[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((it) => ({
          "@type": "Question",
          name: it.q,
          acceptedAnswer: { "@type": "Answer", text: it.a },
        })),
      }}
    />
  );
}

/** BlogPosting — every blog post. */
export function ArticleJsonLd({
  title,
  description,
  path,
  datePublished,
  dateModified,
  authorName,
  image,
}: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  image: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: title,
        description,
        image,
        inLanguage: "fa-IR",
        datePublished,
        dateModified,
        author: { "@type": "Person", name: authorName },
        publisher: {
          "@type": "Organization",
          name: site.name,
          logo: { "@type": "ImageObject", url: absoluteUrl("/icon.png") },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(path) },
      }}
    />
  );
}
