"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useResumeStore } from "@/store/useResumeStore";

/**
 * Whether the download-time empty-field validation is currently flagging fields.
 * The field primitives ({@link EditableText} / {@link RichTextField}) read this
 * to paint a soft-red highlight over an empty required placeholder.
 *
 * CRITICAL — this is the editor-only boundary for the red highlight. Only the
 * live editor ({@link ResumeCanvas}) mounts {@link EmptyHighlightProvider}; the
 * headless /print surface and the public /share view render the same templates
 * WITHOUT it, so the context stays at its `false` default there and the highlight
 * can never paint into a PDF, the print surface, or a shared résumé.
 */
const EmptyHighlightContext = createContext(false);

/** True in the editor while a blocked download is highlighting empty fields. */
export function useEmptyHighlightActive(): boolean {
  return useContext(EmptyHighlightContext);
}

/** Editor-only provider: mirrors the store's `emptyHighlightActive` flag to the
 *  field tree. Never mounted on /print or /share. */
export function EmptyHighlightProvider({ children }: { children: ReactNode }) {
  const active = useResumeStore((state) => state.emptyHighlightActive);
  return (
    <EmptyHighlightContext.Provider value={active}>{children}</EmptyHighlightContext.Provider>
  );
}
