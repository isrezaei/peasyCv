"use client";

import { createContext, useContext } from "react";

/**
 * When true, the inline editors ({@link EditableText} / {@link RichTextField})
 * render their value as a STATIC text node instead of an `<input>` /
 * `contentEditable` — so the exported PDF carries real, extractable text runs
 * rather than form controls, and empty fields (whose placeholders are editor-only
 * affordances) print nothing. The headless /print surface turns this on for EVERY
 * résumé, ATS or not; the live editor keeps its false default so every field
 * stays editable.
 */
export const PrintTextContext = createContext(false);

/** True on the print surface when the résumé should emit static text, not inputs. */
export function usePrintText(): boolean {
  return useContext(PrintTextContext);
}
