import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { Bidi } from "@/components/ui/Bidi";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { blogPosts } from "@/lib/content/blog";

export const metadata: Metadata = pageMetadata({
  title: "وبلاگ",
  description:
    "راهنماها و نکات رزومه‌نویسی فارسی: عبور از فیلتر ATS، تفاوت CV و Resume، اشتباه‌های رایج رزومه و آنچه نباید در رزومه بنویسید — از تیم پیزی‌سی‌وی.",
  path: "/blog",
});

function faDate(iso: string) {
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(
    new Date(iso),
  );
}

export default function BlogIndexPage() {
  const posts = [...blogPosts].sort(
    (a, b) => +new Date(b.datePublished) - +new Date(a.datePublished),
  );

  return (
    <>
      <PageHeader
        eyebrow="وبلاگ"
        eyebrowTone="lavender"
        title="راهنمای رزومه‌نویسی فارسی"
        lead="مقاله‌هایی کاربردی دربارهٔ ساخت رزومهٔ بهتر، عبور از سامانه‌های استخدام و گرفتن شغلی که می‌خواهی."
        breadcrumb={[
          { name: "خانه", path: "/" },
          { name: "وبلاگ", path: "/blog" },
        ]}
      />

      <Section>
        <ul className="grid gap-6 md:grid-cols-2">
          {posts.map((p) => (
            <li key={p.slug}>
              <article className="flex h-full flex-col rounded-2xl border border-ink-10 bg-surface p-6 transition-colors hover:border-ink-20">
                <div className="flex flex-wrap items-center gap-2 text-p3 text-ink-40">
                  <time dateTime={p.datePublished}>{faDate(p.datePublished)}</time>
                  <span aria-hidden>·</span>
                  <span>
                    <Bidi>{p.readingMinutes}</Bidi> دقیقه مطالعه
                  </span>
                </div>
                <h2 className="mt-3 text-h3 font-extrabold text-ink">
                  <Link
                    href={`/blog/${p.slug}`}
                    className="transition-colors hover:text-brand"
                  >
                    {p.title}
                  </Link>
                </h2>
                <p className="mt-3 flex-1 text-p2 leading-8 text-ink-60">
                  {p.excerpt}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-tint px-3 py-1 text-p3 text-ink-60"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Section>

      <BreadcrumbJsonLd
        items={[
          { name: "خانه", path: "/" },
          { name: "وبلاگ", path: "/blog" },
        ]}
      />
    </>
  );
}
