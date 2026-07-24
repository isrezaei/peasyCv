import { Section } from "@/components/ui/Section";
import { Prose } from "@/components/ui/Prose";
import { Cta } from "@/components/ui/Cta";
import { PageHeader } from "@/components/marketing/PageHeader";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { ResumePreview } from "@/components/marketing/ResumePreview";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";
import type { QA } from "@/lib/content/faq";
import { site } from "@/lib/site";

export type LandingContent = {
  path: string;
  breadcrumbName: string;
  eyebrow: string;
  eyebrowTone?: "brand" | "orange" | "lavender" | "turquoise" | "red";
  title: string;
  lead: string;
  preview: { variant: "minimal" | "column" | "band"; accent: string };
  intro: { heading: string; paragraphs: string[] };
  benefits: { title: string; desc: string }[];
  /** Links to a related landing/section — internal linking for authority flow. */
  related: { href: string; label: string; note: string };
  faq: QA[];
  ctaTitle: string;
};

/**
 * Shared skeleton for the high-intent landing pages. Each page supplies unique
 * copy (no boilerplate duplication → no keyword cannibalization); this component
 * only owns the layout, the single <h1> via PageHeader, and the JSON-LD.
 */
export function LandingTemplate({ content: c }: { content: LandingContent }) {
  const crumb = [
    { name: "خانه", path: "/" },
    { name: c.breadcrumbName, path: c.path },
  ];

  return (
    <>
      <PageHeader
        eyebrow={c.eyebrow}
        eyebrowTone={c.eyebrowTone}
        title={c.title}
        lead={c.lead}
        breadcrumb={crumb}
      >
        <Cta href={site.studioUrl} external variant="primary" size="lg">
          ساخت رایگان رزومه
        </Cta>
      </PageHeader>

      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[1.4fr_1fr]">
          <Prose>
            <h2>{c.intro.heading}</h2>
            {c.intro.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </Prose>
          <div className="mx-auto w-full max-w-[280px]">
            <ResumePreview variant={c.preview.variant} accent={c.preview.accent} />
          </div>
        </div>
      </Section>

      <Section tint labelledBy="landing-benefits">
        <h2
          id="landing-benefits"
          className="max-w-2xl text-h2 font-extrabold text-ink"
        >
          چرا این روش بهتر است
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {c.benefits.map((b) => (
            <div
              key={b.title}
              className="rounded-2xl border border-ink-10 bg-surface p-6"
            >
              <h3 className="text-h4 font-bold text-ink">{b.title}</h3>
              <p className="mt-2 text-p3 leading-7 text-ink-60">{b.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-p2 text-ink-60">
          {c.related.note}{" "}
          <a
            href={c.related.href}
            className="font-semibold text-brand underline underline-offset-2"
          >
            {c.related.label}
          </a>
          .
        </p>
      </Section>

      <Section labelledBy="landing-faq">
        <div className="mx-auto max-w-3xl">
          <h2
            id="landing-faq"
            className="text-center text-h2 font-extrabold text-ink"
          >
            پرسش‌های متداول
          </h2>
          <div className="mt-8">
            <FaqAccordion items={c.faq} />
          </div>
        </div>
      </Section>

      <Section tint>
        <div className="rounded-3xl border border-ink-10 bg-foreground px-6 py-12 text-center text-background sm:px-12">
          <h2 className="mx-auto max-w-2xl text-h2 font-extrabold text-balance">
            {c.ctaTitle}
          </h2>
          <div className="mt-8 flex justify-center">
            <Cta href={site.studioUrl} external variant="accent" size="lg">
              ورود به رزومه‌ساز
            </Cta>
          </div>
        </div>
      </Section>

      <BreadcrumbJsonLd items={crumb} />
      <FaqJsonLd items={c.faq} />
    </>
  );
}
