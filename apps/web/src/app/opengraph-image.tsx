import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "پیزی‌سی‌وی — ساخت رزومهٔ حرفه‌ای فارسی و انگلیسی";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** Homepage / default share card. */
export default async function Image() {
  return renderOgImage({
    title: "رزومهٔ حرفه‌ای فارسی و انگلیسی، ساده و سریع",
    eyebrow: "پیزی‌سی‌وی",
  });
}
