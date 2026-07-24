import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The primary conversion element, repeated site-wide. It is a plain styled
 * anchor (server-rendered, zero client JS) because Core Web Vitals matter most
 * on exactly this element — HeroUI's interactive Button/Link (React Aria) is
 * reserved for genuine interactive islands (header CTA, contact form, overlays).
 *
 * Variants match the design system: primary = warm-black pill (#3c3a39),
 * ghost = transparent pill with text only, accent = the blue brand pill.
 * Internal links use next/link; external (studio) links get target+rel.
 */
type Variant = "primary" | "ghost" | "accent";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-[transform,background-color,border-color,color] duration-150 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-foreground text-background hover:bg-[#2c2a29] active:scale-[0.98]",
  accent: "bg-brand text-white hover:bg-brand-strong active:scale-[0.98]",
  ghost:
    "bg-transparent text-ink-80 hover:text-ink border border-ink-10 hover:border-ink-20",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-p3",
  lg: "h-12 px-7 text-p2",
};

export function Cta({
  href,
  children,
  variant = "primary",
  size = "md",
  external = false,
  className = "",
  ariaLabel,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  external?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener"
        aria-label={ariaLabel}
        className={cls}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} aria-label={ariaLabel} className={cls}>
      {children}
    </Link>
  );
}
