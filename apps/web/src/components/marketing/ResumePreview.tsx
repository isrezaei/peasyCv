/**
 * A pure-CSS mini résumé (A4 aspect), RTL. No <img> — so it adds zero network
 * weight and never causes layout shift. Reused in the hero, /templates and
 * /resume-samples. `variant` switches the layout family; `accent` recolors the
 * template's highlight. Decorative: aria-hidden, the page text describes it.
 */
type Variant = "minimal" | "column" | "band";

const bar = "block rounded-full bg-ink-10";

function Lines({ n, widths }: { n: number; widths: string[] }) {
  return (
    <div className="space-y-1.5">
      {Array.from({ length: n }).map((_, i) => (
        <span
          key={i}
          className={`${bar} h-1.5`}
          style={{ width: widths[i % widths.length] }}
        />
      ))}
    </div>
  );
}

export function ResumePreview({
  variant = "minimal",
  accent = "#2677ff",
  name = "نگار محمدی",
  role = "کارشناس ارشد بازاریابی",
  className = "",
}: {
  variant?: Variant;
  accent?: string;
  name?: string;
  role?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      dir="rtl"
      className={`aspect-[1/1.414] w-full overflow-hidden rounded-xl border border-ink-10 bg-white shadow-[0_1px_2px_rgba(11,9,7,0.04)] ${className}`}
    >
      {variant === "band" && (
        <div className="h-[22%] px-5 py-4 text-white" style={{ background: accent }}>
          <p className="text-[11px] font-bold leading-tight">{name}</p>
          <p className="mt-1 text-[8px] opacity-90">{role}</p>
          <span className="mt-2 block h-px w-10 bg-white/50" />
        </div>
      )}

      {variant !== "column" ? (
        <div className="space-y-3 p-5">
          {variant === "minimal" && (
            <div className="border-b border-ink-10 pb-3">
              <p className="text-[11px] font-extrabold text-ink">{name}</p>
              <p className="mt-1 text-[8px]" style={{ color: accent }}>
                {role}
              </p>
            </div>
          )}
          {["سابقهٔ شغلی", "تحصیلات", "مهارت‌ها"].map((s) => (
            <div key={s} className="space-y-1.5">
              <p
                className="text-[8px] font-bold"
                style={{ color: variant === "band" ? accent : undefined }}
              >
                {s}
              </p>
              <Lines n={3} widths={["100%", "82%", "60%"]} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid h-full grid-cols-[38%_62%]">
          <div className="space-y-3 p-4" style={{ background: `${accent}14` }}>
            <div
              className="mx-auto h-9 w-9 rounded-full"
              style={{ background: accent }}
            />
            <p className="text-center text-[9px] font-extrabold text-ink">
              {name}
            </p>
            {["ارتباط", "مهارت‌ها"].map((s) => (
              <div key={s} className="space-y-1.5">
                <p className="text-[7px] font-bold" style={{ color: accent }}>
                  {s}
                </p>
                <Lines n={3} widths={["100%", "70%", "85%"]} />
              </div>
            ))}
          </div>
          <div className="space-y-3 p-4">
            <p className="text-[8px]" style={{ color: accent }}>
              {role}
            </p>
            {["سابقهٔ شغلی", "تحصیلات"].map((s) => (
              <div key={s} className="space-y-1.5">
                <p className="text-[8px] font-bold text-ink">{s}</p>
                <Lines n={4} widths={["100%", "88%", "72%", "55%"]} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
