import type { ReactNode } from "react";

/**
 * The site's signature section gesture — the Persian-appropriate replacement for
 * the source design's Latin `/mono` eyebrow (which reads badly in RTL). It pairs
 * a short accent rule with a small label. The rule sits on the inline-start via
 * logical layout so it mirrors correctly in RTL. No negative tracking (Persian).
 *
 * `tone` swaps the accent hue so different sections can carry different decorative
 * accents while the canvas stays calm.
 */
const toneClass: Record<string, string> = {
  brand: "text-brand before:bg-brand",
  red: "text-accent-red before:bg-accent-red",
  orange: "text-accent-orange before:bg-accent-orange",
  lavender: "text-accent-lavender before:bg-accent-lavender",
  turquoise: "text-accent-turquoise before:bg-accent-turquoise",
};

export function Eyebrow({
  children,
  tone = "brand",
  as: Tag = "p",
}: {
  children: ReactNode;
  tone?: keyof typeof toneClass;
  as?: "p" | "span" | "div";
}) {
  return (
    <Tag
      className={`inline-flex items-center gap-2.5 text-p3 font-semibold ${toneClass[tone]} before:block before:h-[2px] before:w-6 before:rounded-full before:content-['']`}
    >
      {children}
    </Tag>
  );
}
