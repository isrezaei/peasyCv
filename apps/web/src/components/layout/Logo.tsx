import Link from "next/link";
import { site } from "@/lib/site";

/**
 * Brand wordmark. "PeasyCV" is a Latin token, so it's marked .latin (bidi
 * isolated, tight tracking allowed on pure Latin). The blue dot is the single
 * brand-accent flourish. aria-label carries the fixed Persian brand string.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${site.name} — ${site.nameFa}`}
      className={`inline-flex items-baseline gap-0.5 text-xl font-extrabold text-ink ${className}`}
    >
      <span className="latin">PeasyCV</span>
      <span aria-hidden className="text-brand">
        .
      </span>
    </Link>
  );
}
