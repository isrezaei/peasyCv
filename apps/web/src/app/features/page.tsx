import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { Cta } from "@/components/ui/Cta";
import { PageHeader } from "@/components/marketing/PageHeader";
import { FeatureCard } from "@/components/marketing/FeatureCard";
import {
  BreadcrumbJsonLd,
  SoftwareApplicationJsonLd,
} from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { features } from "@/lib/content/features";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "امکانات رزومه‌ساز",
  description:
    "امکانات پیزی‌سی‌وی برای ساخت رزومهٔ فارسی: چیدمان راست‌به‌چپ، قالب‌های حرفه‌ای، پیش‌نمایش زنده، خروجی PDF، حالت سازگار با ATS و داشبورد چند رزومه‌ای.",
  path: "/features",
});

export default function FeaturesPage() {
  return (
    <>
      <PageHeader
        eyebrow="امکانات"
        title="ابزارهایی که ساختن رزومه را ساده می‌کنند"
        lead="پیزی‌سی‌وی همهٔ چیزی را که برای یک رزومهٔ فارسیِ حرفه‌ای لازم دارید در یک‌جا جمع کرده است — از پشتیبانی درست راست‌به‌چپ تا خروجی سازگار با سامانه‌های استخدام."
        breadcrumb={[
          { name: "خانه", path: "/" },
          { name: "امکانات", path: "/features" },
        ]}
      />

      <Section>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <FeatureCard key={f.title} feature={f} />
          ))}
        </div>
      </Section>

      <Section tint labelledBy="feat-deep">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 id="feat-deep" className="text-h2 font-extrabold text-ink">
              ساخته‌شده برای زبان فارسی، نه ترجمه‌شده از انگلیسی
            </h2>
            <p className="mt-4 text-p2 leading-8 text-ink-60">
              بسیاری از رزومه‌سازها فارسی را به‌عنوان یک زبان فرعی اضافه کرده‌اند و
              نتیجه، به‌هم‌ریختگی اعداد، تاریخ و واژه‌های انگلیسی است. پیزی‌سی‌وی از
              پایه راست‌به‌چپ است: نیم‌فاصله، اعداد فارسی، تاریخ شمسی و جداسازی
              درست واژه‌های لاتین همگی رعایت می‌شوند.
            </p>
            <ul className="mt-6 space-y-3 text-p2 text-ink-80">
              {[
                "چیدمان راست‌به‌چپ در همهٔ قالب‌ها",
                "پشتیبانی از متن دوجهته (فارسی + انگلیسی)",
                "خروجی PDF با متن قابل‌انتخاب و جست‌وجو",
                "تنظیم رنگ، فاصله و سبک هر بخش",
              ].map((li) => (
                <li key={li} className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="mt-2 block h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
                  />
                  {li}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Cta href={site.studioUrl} external variant="primary">
                همین حالا امتحان کنید
              </Cta>
            </div>
          </div>
          <div className="rounded-2xl border border-ink-10 bg-surface p-6">
            <div className="space-y-4">
              {[
                ["پیش‌نمایش زنده", "هر تغییر بی‌درنگ روی صفحهٔ A4"],
                ["حالت ATS", "ساختار متنی تمیز و قابل‌خواندن برای ماشین"],
                ["چند رزومه", "یک نسخهٔ متفاوت برای هر موقعیت شغلی"],
              ].map(([t, d]) => (
                <div
                  key={t}
                  className="flex items-center justify-between rounded-xl border border-ink-10 bg-tint px-4 py-3"
                >
                  <span className="text-p2 font-semibold text-ink">{t}</span>
                  <span className="text-p3 text-ink-60">{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <BreadcrumbJsonLd
        items={[
          { name: "خانه", path: "/" },
          { name: "امکانات", path: "/features" },
        ]}
      />
      <SoftwareApplicationJsonLd />
    </>
  );
}
