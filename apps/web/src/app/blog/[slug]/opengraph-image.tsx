import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { getBlogPost, blogPosts } from "@/lib/content/blog";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  return renderOgImage({
    title: post ? post.title : "وبلاگ پیزی‌سی‌وی",
    eyebrow: "مقاله",
  });
}
