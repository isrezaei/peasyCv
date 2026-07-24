import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Cta } from "@/components/ui/Cta";
import { Logo } from "@/components/layout/Logo";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { primaryNav } from "@/lib/nav";
import { site } from "@/lib/site";

/**
 * Sticky site header. Semantic <nav>; desktop links are server-rendered anchors
 * (zero JS), the mobile menu is the single HeroUI island. Hairline bottom border
 * (outlined, not shadowed) per the design system.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-10 bg-canvas/85 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav aria-label="ناوبری اصلی" className="hidden md:block">
            <ul className="flex items-center gap-6">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-p3 font-medium text-ink-60 transition-colors hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Cta
            href={site.studioUrl}
            external
            variant="primary"
            size="md"
            className="hidden sm:inline-flex"
          >
            ساخت رزومه
          </Cta>
          <MobileMenu />
        </div>
      </Container>
    </header>
  );
}
