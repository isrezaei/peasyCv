import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

type Crumb = { name: string; path: string };

/**
 * Shared hero for content/landing pages: optional breadcrumb, the single <h1>,
 * an eyebrow, and a lead paragraph. Keeps one H1 per page and a consistent gesture.
 */
export function PageHeader({
  eyebrow,
  eyebrowTone = "brand",
  title,
  lead,
  breadcrumb,
  children,
}: {
  eyebrow: string;
  eyebrowTone?: "brand" | "orange" | "lavender" | "turquoise" | "red";
  title: string;
  lead: ReactNode;
  breadcrumb?: Crumb[];
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-ink-10 bg-tint">
      <Container className="py-14 sm:py-20">
        {breadcrumb && (
          <nav aria-label="مسیر" className="mb-5">
            <ol className="flex flex-wrap items-center gap-2 text-p3 text-ink-40">
              {breadcrumb.map((c, i) => (
                <li key={c.path} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden>/</span>}
                  {i < breadcrumb.length - 1 ? (
                    <Link href={c.path} className="hover:text-ink">
                      {c.name}
                    </Link>
                  ) : (
                    <span className="text-ink-60">{c.name}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <Eyebrow tone={eyebrowTone}>{eyebrow}</Eyebrow>
        <h1 className="mt-4 max-w-3xl text-h1 font-extrabold text-ink text-balance">
          {title}
        </h1>
        <div className="mt-5 max-w-2xl text-p1 text-ink-60 text-pretty">{lead}</div>
        {children && <div className="mt-8">{children}</div>}
      </Container>
    </header>
  );
}
