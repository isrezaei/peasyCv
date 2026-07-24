import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/Section";
import { Cta } from "@/components/ui/Cta";
import { PageHeader } from "@/components/marketing/PageHeader";
import { ResumePreview } from "@/components/marketing/ResumePreview";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { getRoleSample, roleSamples } from "@/lib/content/samples";
import { site } from "@/lib/site";

type Params = { role: string };

export function generateStaticParams(): Params[] {
  return roleSamples.map((s) => ({ role: s.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { role } = await params;
  const sample = getRoleSample(role);
  if (!sample) return {};
  return pageMetadata({
    title: sample.title,
    description: sample.description,
    path: `/resume-samples/${sample.slug}`,
  });
}

export default async function RoleSamplePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { role } = await params;
  const sample = getRoleSample(role);
  if (!sample) notFound();

  const crumb = [
    { name: "خانه", path: "/" },
    { name: "نمونه رزومه", path: "/resume-samples" },
    { name: sample.role, path: `/resume-samples/${sample.slug}` },
  ];

  return (
    <>
      <PageHeader
        eyebrow={`نمونه رزومه — ${sample.role}`}
        title={sample.title}
        lead={sample.description}
        breadcrumb={crumb}
      >
        <Cta href={site.studioUrl} external variant="primary" size="lg">
          ساخت رزومهٔ {sample.role}
        </Cta>
      </PageHeader>

      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div className="mx-auto w-full max-w-[300px] lg:sticky lg:top-24">
            <ResumePreview
              variant={sample.previewVariant}
              accent={sample.accent}
              role={sample.role}
            />
          </div>

          <div>
            <h2 className="text-h3 font-extrabold text-ink">خلاصهٔ حرفه‌ای نمونه</h2>
            <p className="mt-3 rounded-2xl border border-ink-10 bg-tint p-5 text-p2 leading-8 text-ink-80">
              {sample.summary}
            </p>

            <h2 className="mt-10 text-h3 font-extrabold text-ink">
              مهارت‌های کلیدی
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {sample.skills.map((sk) => (
                <li
                  key={sk}
                  className="rounded-full border border-ink-10 bg-surface px-3.5 py-1.5 text-p3 text-ink-80"
                >
                  {sk}
                </li>
              ))}
            </ul>

            <h2 className="mt-10 text-h3 font-extrabold text-ink">
              نکات نوشتن رزومهٔ {sample.role}
            </h2>
            <div className="mt-4 space-y-4">
              {sample.tips.map((t) => (
                <div
                  key={t.heading}
                  className="rounded-2xl border border-ink-10 bg-surface p-5"
                >
                  <h3 className="text-h4 font-bold text-ink">{t.heading}</h3>
                  <p className="mt-2 text-p3 leading-7 text-ink-60">{t.body}</p>
                </div>
              ))}
            </div>

            <p className="mt-8 text-p2 text-ink-60">
              می‌خواهی رزومه‌ات از فیلترهای خودکار عبور کند؟{" "}
              <a
                href="/resume-ats"
                className="font-semibold text-brand underline underline-offset-2"
              >
                دربارهٔ رزومهٔ سازگار با ATS بخوان
              </a>
              .
            </p>
          </div>
        </div>
      </Section>

      <BreadcrumbJsonLd items={crumb} />
    </>
  );
}
