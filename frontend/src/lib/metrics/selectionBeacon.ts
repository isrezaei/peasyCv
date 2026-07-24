import { recordSelection } from "@/lib/api/admin";

/**
 * Design-selection analytics beacon. Fires ONLY from the store setters, and only
 * when the value actually changes (the setter compares against current state) —
 * never on load or hydration, since the résumé document is loaded by replacing
 * state wholesale, not by calling these setters. Anonymous: kind + chosen id
 * only, no user id. Fire-and-forget: a metrics failure never touches the editor.
 */
export type SelectionKind = "background" | "theme" | "template" | "font";

export function pingSelection(kind: SelectionKind, value: string): void {
  if (typeof window === "undefined") return;
  void recordSelection(kind, value).catch(() => {
    /* metrics are best-effort; swallow so the editor is never affected */
  });
}
