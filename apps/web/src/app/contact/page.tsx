import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { ContactForm } from "@/components/marketing/ContactForm";
import { Bidi } from "@/components/ui/Bidi";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "تماس با ما",
  description:
    "با تیم پیزی‌سی‌وی در تماس باشید. سؤال، پیشنهاد یا مشکلی دربارهٔ ساخت رزومهٔ فارسی دارید؟ فرم تماس را پر کنید یا مستقیم برایمان ایمیل بفرستید.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="تماس"
        eyebrowTone="orange"
        title="با ما در تماس باشید"
        lead="پرسش، پیشنهاد یا بازخوردی دارید؟ خوشحال می‌شویم بشنویم. فرم را پر کنید تا در اولین فرصت پاسخ دهیم."
        breadcrumb={[
          { name: "خانه", path: "/" },
          { name: "تماس با ما", path: "/contact" },
        ]}
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="text-h3 font-extrabold text-ink">راه‌های ارتباطی</h2>
            <p className="mt-3 text-p2 leading-8 text-ink-60">
              برای پشتیبانی، همکاری یا هر پرسش دیگری می‌توانید از فرم روبه‌رو یا
              نشانی ایمیل زیر استفاده کنید.
            </p>
            <dl className="mt-6 space-y-4 text-p2">
              <div>
                <dt className="text-p3 font-semibold text-ink-40">ایمیل</dt>
                <dd className="mt-1">
                  <a
                    className="text-brand underline underline-offset-2"
                    href={`mailto:${site.contactEmail}`}
                  >
                    <Bidi>{site.contactEmail}</Bidi>
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-p3 font-semibold text-ink-40">
                  شبکه‌های اجتماعی
                </dt>
                <dd className="mt-1 flex gap-4 text-ink-60">
                  <a
                    href={site.socials.linkedin}
                    target="_blank"
                    rel="noopener"
                    className="hover:text-ink"
                  >
                    لینکدین
                  </a>
                  <a
                    href={site.socials.instagram}
                    target="_blank"
                    rel="noopener"
                    className="hover:text-ink"
                  >
                    اینستاگرام
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-ink-10 bg-surface p-6 sm:p-8">
            <ContactForm />
          </div>
        </div>
      </Section>

      <BreadcrumbJsonLd
        items={[
          { name: "خانه", path: "/" },
          { name: "تماس با ما", path: "/contact" },
        ]}
      />
    </>
  );
}
