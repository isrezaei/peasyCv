import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { getRoleSample, roleSamples } from "@/lib/content/samples";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return roleSamples.map((s) => ({ role: s.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  const sample = getRoleSample(role);
  return renderOgImage({
    title: sample ? sample.title : "نمونه رزومه",
    eyebrow: "نمونه رزومه",
  });
}
