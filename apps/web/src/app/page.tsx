import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Cta } from "@/components/ui/Cta";
import { FeatureCard } from "@/components/marketing/FeatureCard";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { ResumePreview } from "@/components/marketing/ResumePreview";
import {
  FaqJsonLd,
  SoftwareApplicationJsonLd,
} from "@/components/seo/JsonLd";
import { features } from "@/lib/content/features";
import { generalFaq } from "@/lib/content/faq";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute:
      "ساخت رزومهٔ حرفه‌ای فارسی و انگلیسی به‌صورت آنلاین | پیزی‌سی‌وی",
  },
  description:
    "با پیزی‌سی‌وی رزومهٔ فارسی و راست‌به‌چپ حرفه‌ای بسازید: قالب‌های زیبا، پیش‌نمایش زنده، خروجی PDF و حالت سازگار با ATS. رایگان، آنلاین و بدون نصب.",
  alternates: { canonical: "/" },
};

const steps = [
  {
    n: "۱",
    title: "قالب را انتخاب کنید",
    desc: "از میان قالب‌های فارسی و راست‌به‌چپ، طرحی متناسب با حرفه‌تان بردارید.",
  },
  {
    n: "۲",
    title: "اطلاعات را وارد کنید",
    desc: "با پیش‌نمایش زنده، هر بخش را پر کنید و بی‌درنگ نتیجه را روی صفحهٔ A4 ببینید.",
  },
  {
    n: "۳",
    title: "PDF بگیرید",
    desc: "خروجی برداری و باکیفیت چاپ را دانلود کنید و برای کارفرما بفرستید.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <Container className="grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2">
          <div>
            <Eyebrow>رزومه‌ساز فارسی و راست‌به‌چپ</Eyebrow>
            <h1 className="mt-5 text-h0 font-extrabold text-ink text-balance">
              رزومه‌ای بساز که تو را{" "}
              <span className="text-brand">استخدام‌شدنی</span> نشان دهد
            </h1>
            <p className="mt-5 max-w-xl text-p1 text-ink-60 text-pretty">
              پیزی‌سی‌وی یک رزومه‌ساز آنلاین فارسی است؛ با قالب‌های حرفه‌ای،
              پیش‌نمایش زنده و خروجی PDF سازگار با ATS. بدون نصب، بدون پیچیدگی —
              همین حالا شروع کن.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Cta href={site.studioUrl} external variant="primary" size="lg">
                ساخت رایگان رزومه
              </Cta>
              <Cta href="/templates" variant="ghost" size="lg">
                دیدن قالب‌ها
              </Cta>
            </div>
            <p className="mt-4 text-p3 text-ink-40">
              رایگان برای شروع · بدون نیاز به کارت بانکی · خروجی PDF فوری
            </p>
          </div>

          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-8 -z-10 rounded-[40px] bg-tint"
            />
            <div className="mx-auto grid max-w-md grid-cols-2 gap-4">
              <ResumePreview variant="minimal" className="translate-y-4" />
              <ResumePreview
                variant="band"
                accent="#817fff"
                name="آرش کریمی"
                role="مهندس نرم‌افزار"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* TRUST STRIP */}
      <div className="border-y border-ink-10 bg-tint">
        <Container className="grid grid-cols-2 gap-6 py-8 text-center sm:grid-cols-4">
          {[
            ["۱۰۰٪", "فارسی و راست‌به‌چپ"],
            ["رایگان", "برای ساخت و دانلود"],
            ["ATS", "ساختار سازگار با فیلترها"],
            ["PDF", "خروجی باکیفیت چاپ"],
          ].map(([big, small]) => (
            <div key={small}>
              <p className="text-h3 font-extrabold text-ink">{big}</p>
              <p className="mt-1 text-p3 text-ink-60">{small}</p>
            </div>
          ))}
        </Container>
      </div>

      {/* FEATURES */}
      <Section labelledBy="home-features">
        <div className="max-w-2xl">
          <Eyebrow tone="lavender">چرا پیزی‌سی‌وی</Eyebrow>
          <h2
            id="home-features"
            className="mt-4 text-h1 font-extrabold text-ink"
          >
            همهٔ چیزی که برای یک رزومهٔ فارسیِ حرفه‌ای لازم داری
          </h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.slice(0, 6).map((f) => (
            <FeatureCard key={f.title} feature={f} />
          ))}
        </div>
      </Section>

      {/* HOW IT WORKS */}
      <Section tint labelledBy="home-steps">
        <div className="max-w-2xl">
          <Eyebrow tone="orange">سه گام ساده</Eyebrow>
          <h2 id="home-steps" className="mt-4 text-h1 font-extrabold text-ink">
            از صفحهٔ خالی تا رزومهٔ آماده، در چند دقیقه
          </h2>
        </div>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <li
              key={s.n}
              className="rounded-2xl border border-ink-10 bg-surface p-6"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-p2 font-bold text-background">
                {s.n}
              </span>
              <h3 className="mt-4 text-h4 font-bold text-ink">{s.title}</h3>
              <p className="mt-2 text-p3 leading-7 text-ink-60">{s.desc}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* SAMPLES */}
      <Section labelledBy="home-samples">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <Eyebrow tone="turquoise">نمونه‌ها</Eyebrow>
            <h2
              id="home-samples"
              className="mt-4 text-h1 font-extrabold text-ink"
            >
              قالب‌هایی که برای فارسی طراحی شده‌اند
            </h2>
          </div>
          <Cta href="/templates" variant="ghost">
            همهٔ قالب‌ها
          </Cta>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          <ResumePreview variant="minimal" />
          <ResumePreview variant="column" accent="#ff7300" />
          <ResumePreview variant="band" accent="#2677ff" />
          <ResumePreview
            variant="column"
            accent="#79deeb"
            name="سارا احمدی"
            role="طراح گرافیک"
          />
        </div>
      </Section>

      {/* FAQ */}
      <Section tint labelledBy="home-faq">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <Eyebrow tone="brand" as="div">
              <span className="mx-auto">پرسش‌های متداول</span>
            </Eyebrow>
            <h2 id="home-faq" className="mt-4 text-h1 font-extrabold text-ink">
              سؤال‌های پرتکرار
            </h2>
          </div>
          <div className="mt-10">
            <FaqAccordion items={generalFaq} />
          </div>
        </div>
      </Section>

      {/* FINAL CTA */}
      <Section>
        <div className="rounded-3xl border border-ink-10 bg-foreground px-6 py-14 text-center text-background sm:px-12">
          <h2 className="mx-auto max-w-2xl text-h1 font-extrabold text-balance">
            امروز رزومهٔ حرفه‌ای‌ات را بساز
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-p2 text-background/70">
            رایگان شروع کن، در چند دقیقه یک رزومهٔ فارسیِ تمیز و سازگار با ATS
            بساز و خروجی PDF بگیر.
          </p>
          <div className="mt-8 flex justify-center">
            <Cta
              href={site.studioUrl}
              external
              variant="accent"
              size="lg"
            >
              ورود به رزومه‌ساز
            </Cta>
          </div>
        </div>
      </Section>

      <SoftwareApplicationJsonLd />
      <FaqJsonLd items={generalFaq} />
    </>
  );
}
