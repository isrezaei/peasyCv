import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ساخت رزومهٔ فارسی`,
    short_name: site.name,
    description:
      "رزومه‌ساز آنلاین فارسی و راست‌به‌چپ با قالب‌های حرفه‌ای، پیش‌نمایش زنده و خروجی PDF سازگار با ATS.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    lang: "fa-IR",
    dir: "rtl",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
