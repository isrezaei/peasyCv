import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { Cta } from "@/components/ui/Cta";
import { PageHeader } from "@/components/marketing/PageHeader";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { generalFaq } from "@/lib/content/faq";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "پرسش‌های متداول",
  description:
    "پاسخ پرسش‌های رایج دربارهٔ پیزی‌سی‌وی: رایگان بودن، پشتیبانی از فارسی و راست‌به‌چپ، سازگاری با ATS، خروجی PDF و نگهداری اطلاعات رزومه.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <PageHeader
        eyebrow="پشتیبانی"
        title="پرسش‌های متداول"
        lead="هر چه لازم است دربارهٔ ساخت رزومه با پیزی‌سی‌وی بدانید. اگر پاسخ پرسش‌تان این‌جا نبود، از صفحهٔ تماس با ما بپرسید."
        breadcrumb={[
          { name: "خانه", path: "/" },
          { name: "پرسش‌های متداول", path: "/faq" },
        ]}
      />

      <Section>
        <div className="mx-auto max-w-3xl">
          <FaqAccordion items={generalFaq} />

          <div className="mt-12 rounded-2xl border border-ink-10 bg-tint p-8 text-center">
            <h2 className="text-h3 font-extrabold text-ink">
              هنوز سؤالی دارید؟
            </h2>
            <p className="mx-auto mt-3 max-w-md text-p2 text-ink-60">
              خوشحال می‌شویم کمک کنیم. پیام‌تان را بفرستید یا مستقیم رزومه‌تان را
              بسازید.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Cta href="/contact" variant="primary">
                تماس با ما
              </Cta>
              <Cta href={site.studioUrl} external variant="ghost">
                ساخت رزومه
              </Cta>
            </div>
          </div>
        </div>
      </Section>

      <BreadcrumbJsonLd
        items={[
          { name: "خانه", path: "/" },
          { name: "پرسش‌های متداول", path: "/faq" },
        ]}
      />
      <FaqJsonLd items={generalFaq} />
    </>
  );
}
