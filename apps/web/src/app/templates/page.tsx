import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { Cta } from "@/components/ui/Cta";
import { PageHeader } from "@/components/marketing/PageHeader";
import { TemplateGallery } from "@/components/marketing/TemplateGallery";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "قالب‌های رزومه",
  description:
    "گالری قالب‌های رزومهٔ فارسی و راست‌به‌چپ پیزی‌سی‌وی: از قالب‌های ساده و سازگار با ATS تا طرح‌های ستونی و رنگی. پیش‌نمایش ببینید و رایگان استفاده کنید.",
  path: "/templates",
});

export default function TemplatesPage() {
  return (
    <>
      <PageHeader
        eyebrow="قالب‌ها"
        eyebrowTone="lavender"
        title="قالب‌هایی که برای فارسی طراحی شده‌اند"
        lead="هر قالب برای چیدمان راست‌به‌چپ بهینه شده و با فارسی و انگلیسی کار می‌کند. روی هر قالب بزنید تا پیش‌نمایش بزرگ‌تر را ببینید."
        breadcrumb={[
          { name: "خانه", path: "/" },
          { name: "قالب‌ها", path: "/templates" },
        ]}
      />

      <Section>
        <TemplateGallery />
      </Section>

      <Section tint>
        <div className="rounded-3xl border border-ink-10 bg-surface px-6 py-12 text-center sm:px-12">
          <h2 className="mx-auto max-w-2xl text-h2 font-extrabold text-ink text-balance">
            قالب مورد علاقه‌ات را انتخاب کن و شروع کن
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-p2 text-ink-60">
            همهٔ قالب‌ها رایگان‌اند. در چند دقیقه رزومه‌ات را بساز و خروجی PDF
            بگیر.
          </p>
          <div className="mt-8 flex justify-center">
            <Cta href={site.studioUrl} external variant="primary" size="lg">
              ساخت رزومه
            </Cta>
          </div>
        </div>
      </Section>

      <BreadcrumbJsonLd
        items={[
          { name: "خانه", path: "/" },
          { name: "قالب‌ها", path: "/templates" },
        ]}
      />
    </>
  );
}
