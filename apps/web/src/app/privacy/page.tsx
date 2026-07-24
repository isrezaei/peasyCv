import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { Prose } from "@/components/ui/Prose";
import { PageHeader } from "@/components/marketing/PageHeader";
import { Bidi } from "@/components/ui/Bidi";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "حریم خصوصی",
  description:
    "سیاست حریم خصوصی پیزی‌سی‌وی: چه اطلاعاتی جمع‌آوری می‌شود، چطور از داده‌های رزومهٔ شما محافظت می‌کنیم و شما چه کنترلی روی اطلاعات‌تان دارید.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="حریم خصوصی"
        title="سیاست حریم خصوصی"
        lead="اطلاعات رزومهٔ شما متعلق به خودتان است. این صفحه توضیح می‌دهد چه داده‌ای و چرا نگهداری می‌شود."
        breadcrumb={[
          { name: "خانه", path: "/" },
          { name: "حریم خصوصی", path: "/privacy" },
        ]}
      />

      <Section>
        <Prose>
          <p>
            آخرین به‌روزرسانی: تیر ۱۴۰۵. این سیاست توضیح می‌دهد که پیزی‌سی‌وی چه
            اطلاعاتی را جمع‌آوری و چگونه از آن‌ها محافظت می‌کند.
          </p>

          <h2>چه اطلاعاتی جمع‌آوری می‌کنیم</h2>
          <ul>
            <li>
              محتوایی که برای رزومه وارد می‌کنید (نام، سابقهٔ شغلی، تحصیلات و
              مانند آن).
            </li>
            <li>
              در صورت ثبت‌نام، نشانی ایمیل برای ورود و بازیابی حساب.
            </li>
            <li>داده‌های فنی پایه مانند نوع مرورگر برای بهبود عملکرد سایت.</li>
          </ul>

          <h2>حالت مهمان</h2>
          <p>
            اگر بدون ثبت‌نام و به‌صورت مهمان کار کنید، اطلاعات رزومه روی همان
            دستگاه شما نگهداری می‌شود و برای ما ارسال نمی‌شود مگر آنکه حساب بسازید.
          </p>

          <h2>چطور از اطلاعات استفاده می‌کنیم</h2>
          <p>
            اطلاعات شما تنها برای ارائهٔ سرویس ساخت رزومه استفاده می‌شود. ما
            محتوای رزومهٔ شما را نمی‌فروشیم و در اختیار اشخاص ثالث برای تبلیغات قرار
            نمی‌دهیم.
          </p>

          <h2>کنترل شما</h2>
          <p>
            می‌توانید رزومه‌های خود را ویرایش یا حذف کنید. برای حذف کامل حساب یا
            هر پرسشی دربارهٔ داده‌هایتان، از طریق نشانی{" "}
            <a href={`mailto:${site.contactEmail}`}>
              <Bidi>{site.contactEmail}</Bidi>
            </a>{" "}
            با ما در تماس باشید.
          </p>
        </Prose>
      </Section>

      <BreadcrumbJsonLd
        items={[
          { name: "خانه", path: "/" },
          { name: "حریم خصوصی", path: "/privacy" },
        ]}
      />
    </>
  );
}
