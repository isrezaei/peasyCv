import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "رزومهٔ سازگار با ATS — پیزی‌سی‌وی";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderOgImage({
    title: "رزومه‌ای که از فیلتر ATS عبور می‌کند",
    eyebrow: "رزومهٔ ATS",
  });
}
