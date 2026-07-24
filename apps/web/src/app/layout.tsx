import type { Metadata, Viewport } from "next";
import { vazirmatn } from "@/lib/fonts";
import { site } from "@/lib/site";
import { Providers } from "@/components/Providers";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "ساخت رزومهٔ حرفه‌ای فارسی و انگلیسی | پیزی‌سی‌وی",
    template: `%s | ${site.nameFa}`,
  },
  description:
    "پیزی‌سی‌وی؛ رزومه‌ساز آنلاین فارسی و راست‌به‌چپ با پیش‌نمایش زنده، قالب‌های حرفه‌ای، خروجی PDF و حالت سازگار با ATS. رایگان و بدون نیاز به نصب رزومه بسازید.",
  alternates: { canonical: "/" },
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: site.name,
  },
  twitter: { card: "summary_large_image", creator: "@peasycv" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="min-h-dvh bg-canvas text-ink antialiased">
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:inset-inline-start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
          >
            پرش به محتوای اصلی
          </a>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </Providers>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
      </body>
    </html>
  );
}
