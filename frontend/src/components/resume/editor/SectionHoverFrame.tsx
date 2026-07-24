"use client";

import type { ReactNode } from "react";
import type { SectionMeta } from "@/types";
import { SectionCompactMenu } from "./SectionCompactMenu";
import { SectionFrame } from "./SectionFrame";

interface SectionHoverFrameProps {
  section: SectionMeta;
  /** The section's rendered title; the dots control overlays its row, never displacing it. */
  title: ReactNode;
  /** The section content, wrapped by the hover border. */
  children: ReactNode;
  /** Light vs dark surrounding column — adapts the solid dots chip so it reads. */
  tone?: "onLight" | "onDark";
}

/**
 * Every section's HoverFrame: a single BARE 3-dots glyph (the
 * {@link SectionCompactMenu}) — no button skin, painted in the resume accent —
 * overlaid on the title row via {@link SectionFrame}, so it sits on the heading's
 * baseline and can never push or compress the layout. The title block stays pure
 * presentation; every tool lives in the dots menu.
 */
export function SectionHoverFrame({ section, title, children, tone = "onLight" }: SectionHoverFrameProps) {
  return (
    <SectionFrame
      title={title}
      tone={tone}
      dir={section.direction}
      controls={<SectionCompactMenu section={section} tone={tone} />}
    >
      {children}
    </SectionFrame>
  );
}
