import type { ReactNode } from "react";

/**
 * Long-form text wrapper with comfortable Persian reading rhythm (line-height
 * ~1.9, generous spacing). Styles descendant headings/lists/links via a scoped
 * class so page bodies can be written as plain semantic HTML.
 */
export function Prose({ children }: { children: ReactNode }) {
  return <div className="rz-prose max-w-3xl">{children}</div>;
}
