import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/**
 * Loads the static Vazirmatn TTFs and embeds them in the OG render so Persian
 * text shapes correctly instead of rendering as tofu boxes. satori can't consume
 * the variable woff2, hence the static Regular/Bold files in /fonts. process.cwd()
 * is the apps/web workspace root at build time.
 */
async function loadFonts() {
  const dir = join(process.cwd(), "fonts");
  const [regular, bold] = await Promise.all([
    readFile(join(dir, "Vazirmatn-Regular.ttf")),
    readFile(join(dir, "Vazirmatn-Bold.ttf")),
  ]);
  return [
    { name: "Vazirmatn", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Vazirmatn", data: bold, weight: 700 as const, style: "normal" as const },
  ];
}

/**
 * The shared share-card: white canvas, warm-black ink, the brand-accent eyebrow
 * rule (the site's signature gesture), a big Persian title, and the wordmark.
 * Every page gets its own card with its own title — cheap, high-leverage SEO.
 */
export async function renderOgImage({
  title,
  eyebrow = "پیزی‌سی‌وی",
}: {
  title: string;
  eyebrow?: string;
}) {
  const fonts = await loadFonts();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: "80px",
          direction: "rtl",
          fontFamily: "Vazirmatn",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{ width: "48px", height: "6px", borderRadius: "9999px", background: "#2677ff" }}
          />
          <div style={{ fontSize: 30, fontWeight: 700, color: "#2677ff" }}>{eyebrow}</div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 68,
            fontWeight: 700,
            lineHeight: 1.3,
            color: "#3c3a39",
            maxWidth: "1000px",
          }}
        >
          {title}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline", fontSize: 40, fontWeight: 700, color: "#3c3a39" }}>
            PeasyCV<span style={{ color: "#2677ff" }}>.</span>
          </div>
          <div style={{ fontSize: 26, color: "rgba(11,9,7,0.6)", direction: "ltr" }}>
            {site.url.replace("https://", "")}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
