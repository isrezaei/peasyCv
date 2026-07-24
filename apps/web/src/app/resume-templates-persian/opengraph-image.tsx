import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "قالب رزومهٔ فارسی — پیزی‌سی‌وی";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderOgImage({
    title: "قالب رزومهٔ فارسی برای هر حرفه",
    eyebrow: "قالب فارسی",
  });
}
