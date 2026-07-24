import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { Prose } from "@/components/ui/Prose";
import { Cta } from "@/components/ui/Cta";
import { PageHeader } from "@/components/marketing/PageHeader";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "دربارهٔ ما",
  description:
    "پیزی‌سی‌وی با یک هدف ساده ساخته شد: کارجویان فارسی‌زبان بتوانند بدون دردسر رزومه‌ای حرفه‌ای و سازگار با ATS بسازند. دربارهٔ مأموریت و ارزش‌های ما بخوانید.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="دربارهٔ ما"
        eyebrowTone="lavender"
        title="می‌خواهیم ساختن رزومهٔ فارسی برای همه ساده باشد"
        lead="پیزی‌سی‌وی را ساختیم چون باور داریم هیچ کارجویی نباید فرصت شغلی‌اش را به‌خاطر یک ابزار ناکارآمد از دست بدهد."
        breadcrumb={[
          { name: "خانه", path: "/" },
          { name: "دربارهٔ ما", path: "/about" },
        ]}
      />

      <Section>
        <Prose>
          <h2>چرا پیزی‌سی‌وی را ساختیم</h2>
          <p>
            بیشتر رزومه‌سازهای موجود برای زبان انگلیسی و چیدمان چپ‌به‌راست طراحی
            شده‌اند. وقتی نوبت به فارسی می‌رسد، نتیجه اغلب به‌هم‌ریختگی اعداد،
            تاریخ و واژه‌های انگلیسی است. ما تصمیم گرفتیم ابزاری بسازیم که از پایه
            برای فارسی و راست‌به‌چپ فکر شده باشد.
          </p>
          <h2>باور ما</h2>
          <p>
            یک رزومهٔ خوب نباید گران یا پیچیده باشد. به همین دلیل ساخت و دانلود
            رزومه در پیزی‌سی‌وی رایگان است و رابط کاربری را تا جای ممکن ساده نگه
            داشته‌ایم؛ شما روی محتوای رزومه تمرکز می‌کنید و ما ظاهر و ساختار درست
            آن را برعهده می‌گیریم.
          </p>
          <h2>تمرکز بر چیزهایی که واقعاً مهم‌اند</h2>
          <ul>
            <li>پشتیبانی درست و کامل از زبان فارسی و متن دوجهته.</li>
            <li>سازگاری با سامانه‌های ATS تا رزومه‌تان دیده شود.</li>
            <li>خروجی PDF تمیز و آمادهٔ ارسال به کارفرما.</li>
            <li>حفظ حریم خصوصی و کنترل شما بر اطلاعات‌تان.</li>
          </ul>
        </Prose>

        <div className="mt-10">
          <Cta href={site.studioUrl} external variant="primary">
            رزومهٔ خود را بسازید
          </Cta>
        </div>
      </Section>

      <BreadcrumbJsonLd
        items={[
          { name: "خانه", path: "/" },
          { name: "دربارهٔ ما", path: "/about" },
        ]}
      />
    </>
  );
}
