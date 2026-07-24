import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { ResumePreview } from "@/components/marketing/ResumePreview";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { roleSamples } from "@/lib/content/samples";

export const metadata: Metadata = pageMetadata({
  title: "نمونه رزومه بر اساس شغل",
  description:
    "مجموعه نمونه رزومهٔ آمادهٔ فارسی برای مشاغل مختلف: مهندس نرم‌افزار، طراح گرافیک، حسابدار، پرستار، بازاریاب و مدیر پروژه — با نکات کاربردی رزومه‌نویسی.",
  path: "/resume-samples",
});

export default function ResumeSamplesIndexPage() {
  return (
    <>
      <PageHeader
        eyebrow="نمونه رزومه"
        eyebrowTone="brand"
        title="نمونه رزومه بر اساس شغل"
        lead="برای شروع سریع‌تر، نمونه رزومه‌ای متناسب با حرفه‌ات را ببین. هر نمونه شامل خلاصهٔ حرفه‌ای، مهارت‌های کلیدی و نکات نوشتن آن شغل است."
        breadcrumb={[
          { name: "خانه", path: "/" },
          { name: "نمونه رزومه", path: "/resume-samples" },
        ]}
      />

      <Section>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {roleSamples.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/resume-samples/${s.slug}`}
                className="group block rounded-2xl border border-ink-10 bg-surface p-5 transition-colors hover:border-ink-20"
              >
                <div className="mx-auto max-w-[200px]">
                  <ResumePreview
                    variant={s.previewVariant}
                    accent={s.accent}
                    role={s.role}
                    className="transition-transform group-hover:-translate-y-1"
                  />
                </div>
                <h2 className="mt-5 text-h4 font-bold text-ink">{s.title}</h2>
                <p className="mt-2 line-clamp-2 text-p3 leading-7 text-ink-60">
                  {s.description}
                </p>
                <span className="mt-3 inline-block text-p3 font-semibold text-brand">
                  دیدن نمونه ←
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <BreadcrumbJsonLd
        items={[
          { name: "خانه", path: "/" },
          { name: "نمونه رزومه", path: "/resume-samples" },
        ]}
      />
    </>
  );
}
