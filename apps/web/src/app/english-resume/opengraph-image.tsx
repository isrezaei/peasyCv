import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "ساخت رزومهٔ انگلیسی و CV — پیزی‌سی‌وی";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderOgImage({
    title: "CV انگلیسی حرفه‌ای برای فرصت‌های بین‌المللی",
    eyebrow: "رزومهٔ انگلیسی",
  });
}
