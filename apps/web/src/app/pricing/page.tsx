import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { Cta } from "@/components/ui/Cta";
import { PageHeader } from "@/components/marketing/PageHeader";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  SoftwareApplicationJsonLd,
} from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import type { QA } from "@/lib/content/faq";

export const metadata: Metadata = pageMetadata({
  title: "تعرفه و قیمت",
  description:
    "پیزی‌سی‌وی برای ساخت و دانلود رزومه رایگان است. بدون هزینهٔ پنهان و بدون نیاز به کارت بانکی؛ همین حالا رزومهٔ فارسی حرفه‌ای بسازید و PDF بگیرید.",
  path: "/pricing",
});

const included = [
  "دسترسی به همهٔ قالب‌های پایه",
  "پیش‌نمایش زنده و ویرایش نامحدود",
  "خروجی PDF باکیفیت چاپ",
  "حالت سازگار با ATS",
  "رزومهٔ فارسی و انگلیسی",
  "شروع بدون ثبت‌نام (حالت مهمان)",
];

const pricingFaq: QA[] = [
  {
    q: "واقعاً رایگان است؟ هزینهٔ پنهانی وجود ندارد؟",
    a: "بله. ساخت رزومه و دانلود PDF رایگان است و برای شروع نیازی به وارد کردن اطلاعات پرداخت نیست.",
  },
  {
    q: "برای دانلود باید ثبت‌نام کنم؟",
    a: "می‌توانید به‌صورت مهمان شروع کنید. ثبت‌نام تنها برای ذخیرهٔ رزومه‌ها و دسترسی از دستگاه‌های مختلف لازم است.",
  },
  {
    q: "آیا در آینده امکانات پولی اضافه می‌شود؟",
    a: "ممکن است امکانات حرفه‌ای بیشتری معرفی شود، اما هستهٔ ساخت و دانلود رزومهٔ فارسی رایگان باقی می‌ماند.",
  },
];

export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="تعرفه"
        eyebrowTone="turquoise"
        title="رایگان بساز، رایگان دانلود کن"
        lead="ساخت رزومه با پیزی‌سی‌وی رایگان است. بدون هزینهٔ پنهان، بدون واترمارک اجباری و بدون نیاز به کارت بانکی."
        breadcrumb={[
          { name: "خانه", path: "/" },
          { name: "تعرفه", path: "/pricing" },
        ]}
      />

      <Section>
        <div className="mx-auto max-w-lg rounded-3xl border border-ink-10 bg-surface p-8 text-center">
          <p className="text-p2 font-semibold text-brand">پلن رایگان</p>
          <p className="mt-3 flex items-baseline justify-center gap-2">
            <span className="text-h0 font-extrabold text-ink">۰</span>
            <span className="text-p1 text-ink-60">تومان</span>
          </p>
          <p className="mt-2 text-p3 text-ink-40">برای همیشه، برای ساخت و دانلود</p>

          <ul className="mt-8 space-y-3 text-start">
            {included.map((li) => (
              <li key={li} className="flex items-start gap-3 text-p2 text-ink-80">
                <CheckIcon />
                {li}
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <Cta
              href={site.studioUrl}
              external
              variant="primary"
              size="lg"
              className="w-full"
            >
              شروع رایگان
            </Cta>
          </div>
        </div>
      </Section>

      <Section tint labelledBy="pricing-faq">
        <div className="mx-auto max-w-3xl">
          <h2
            id="pricing-faq"
            className="text-center text-h2 font-extrabold text-ink"
          >
            پرسش‌های مربوط به تعرفه
          </h2>
          <div className="mt-8">
            <FaqAccordion items={pricingFaq} />
          </div>
        </div>
      </Section>

      <BreadcrumbJsonLd
        items={[
          { name: "خانه", path: "/" },
          { name: "تعرفه", path: "/pricing" },
        ]}
      />
      <SoftwareApplicationJsonLd />
      <FaqJsonLd items={pricingFaq} />
    </>
  );
}

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="mt-0.5 shrink-0 text-brand"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
