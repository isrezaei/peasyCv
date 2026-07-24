import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Cta } from "@/components/ui/Cta";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Bidi } from "@/components/ui/Bidi";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl, site } from "@/lib/site";
import { getBlogPost, blogPosts } from "@/lib/content/blog";
import Link from "next/link";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return pageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    article: {
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
      authors: [post.author],
      tags: post.tags,
    },
  });
}

function faDate(iso: string) {
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(
    new Date(iso),
  );
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const crumb = [
    { name: "خانه", path: "/" },
    { name: "وبلاگ", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ];

  return (
    <>
      <article>
        <header className="border-b border-ink-10 bg-tint">
          <Container className="py-14 sm:py-20">
            <nav aria-label="مسیر" className="mb-5">
              <ol className="flex flex-wrap items-center gap-2 text-p3 text-ink-40">
                {crumb.map((c, i) => (
                  <li key={c.path} className="flex items-center gap-2">
                    {i > 0 && <span aria-hidden>/</span>}
                    {i < crumb.length - 1 ? (
                      <Link href={c.path} className="hover:text-ink">
                        {c.name}
                      </Link>
                    ) : (
                      <span className="line-clamp-1 text-ink-60">{c.name}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
            <Eyebrow>مقاله</Eyebrow>
            <h1 className="mt-4 max-w-3xl text-h1 font-extrabold text-ink text-balance">
              {post.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-p3 text-ink-60">
              <span>{post.author}</span>
              <span aria-hidden>·</span>
              <time dateTime={post.datePublished}>{faDate(post.datePublished)}</time>
              <span aria-hidden>·</span>
              <span>
                <Bidi>{post.readingMinutes}</Bidi> دقیقه مطالعه
              </span>
            </div>
          </Container>
        </header>

        <Container className="py-14">
          <div className="grid gap-10 lg:grid-cols-[1fr_3fr]">
            {/* TABLE OF CONTENTS */}
            <nav
              aria-label="فهرست مطالب"
              className="order-2 lg:order-1 lg:sticky lg:top-24 lg:self-start"
            >
              <p className="text-p3 font-bold text-ink-40">فهرست مطالب</p>
              <ol className="mt-3 space-y-2 border-s border-ink-10 ps-4">
                {post.body.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="text-p3 text-ink-60 transition-colors hover:text-brand"
                    >
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            {/* BODY */}
            <div className="order-1 lg:order-2 rz-prose">
              <p className="text-p1 leading-9 text-ink-80">{post.excerpt}</p>
              {post.body.map((s) => (
                <section key={s.id} aria-labelledby={s.id}>
                  <h2 id={s.id}>{s.heading}</h2>
                  {s.paragraphs?.map((p, i) => <p key={i}>{p}</p>)}
                  {s.list && (
                    <ul>
                      {s.list.map((li, i) => (
                        <li key={i}>{li}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}

              {/* CONTEXTUAL CTA + internal link to a landing page */}
              <div className="mt-10 rounded-2xl border border-ink-10 bg-tint p-6">
                <p className="text-p2 text-ink-80">
                  می‌خواهی این نکته‌ها را همین حالا روی رزومه‌ات پیاده کنی؟ صفحهٔ{" "}
                  <Link
                    href={post.relatedLanding.href}
                    className="font-semibold text-brand underline underline-offset-2"
                  >
                    {post.relatedLanding.label}
                  </Link>{" "}
                  را ببین و رایگان شروع کن.
                </p>
                <div className="mt-5">
                  <Cta href={site.studioUrl} external variant="primary">
                    ساخت رزومه
                  </Cta>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </article>

      <BreadcrumbJsonLd items={crumb} />
      <ArticleJsonLd
        title={post.title}
        description={post.description}
        path={`/blog/${post.slug}`}
        datePublished={post.datePublished}
        dateModified={post.dateModified}
        authorName={post.author}
        image={absoluteUrl(`/blog/${post.slug}/opengraph-image`)}
      />
    </>
  );
}
