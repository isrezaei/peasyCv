import type { ReactNode } from "react";

/**
 * Isolates an embedded LTR token (URL, English term, code, number-with-unit) so
 * it can't scramble the surrounding Persian sentence. We set an explicit
 * dir="ltr" + unicode-bidi: isolate rather than dir="auto" — auto misdetects
 * direction from the first strong character and is unsafe inside RTL prose.
 */
export function Bidi({ children }: { children: ReactNode }) {
  return (
    <span dir="ltr" className="bidi-ltr">
      {children}
    </span>
  );
}
