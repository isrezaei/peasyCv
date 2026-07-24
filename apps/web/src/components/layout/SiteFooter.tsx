import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/layout/Logo";
import { Bidi } from "@/components/ui/Bidi";
import { footerNav } from "@/lib/nav";
import { site } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-ink-10 bg-tint">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-p3 leading-7 text-ink-60">
              رزومه‌ساز آنلاین فارسی و راست‌به‌چپ. حرفه‌ای، سریع و سازگار با
              سامانه‌های ATS — رایگان بسازید و خروجی PDF بگیرید.
            </p>
          </div>
          {footerNav.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-p3 font-bold text-ink">{col.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-p3 text-ink-60 transition-colors hover:text-ink"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-ink-10 pt-6 sm:flex-row sm:items-center">
          <p className="text-p3 text-ink-40">
            © {year} <span className="latin">{site.name}</span> — همهٔ حقوق محفوظ
            است.
          </p>
          <div className="flex items-center gap-5 text-p3 text-ink-60">
            <a
              href={site.socials.linkedin}
              target="_blank"
              rel="noopener"
              className="transition-colors hover:text-ink"
            >
              لینکدین
            </a>
            <a
              href={site.socials.instagram}
              target="_blank"
              rel="noopener"
              className="transition-colors hover:text-ink"
            >
              اینستاگرام
            </a>
            <a
              href={`mailto:${site.contactEmail}`}
              className="transition-colors hover:text-ink"
            >
              <Bidi>{site.contactEmail}</Bidi>
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
