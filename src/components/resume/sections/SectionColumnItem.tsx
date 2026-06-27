"use client";

import { SectionHoverFrame } from "@/components/resume/editor/SectionHoverFrame";
import { SectionTitleBlock } from "@/components/resume/editor/SectionTitleBlock";
import type { ResumeData, SectionMeta } from "@/types";
import { SectionContent } from "./SectionContent";

interface SectionColumnItemProps {
  section: SectionMeta;
  resume: ResumeData;
  accent: string;
  soft: string;
  titleColor?: string;
  showRule?: boolean;
  /** Light vs dark column — forwarded to the chips + dots control so they adapt. */
  tone?: "onLight" | "onDark";
  /**
   * Accepted for call-site compatibility. The HoverFrame is now ALWAYS the single
   * solid dots menu, so this no longer changes the control's form.
   */
  compact?: boolean;
}

/** A titled section block (title + content) for the column-based templates. */
export function SectionColumnItem({
  section,
  resume,
  accent,
  soft,
  titleColor,
  showRule = false,
  tone = "onLight",
}: SectionColumnItemProps) {
  return (
    <SectionHoverFrame
      section={section}
      tone={tone}
      title={
        <SectionTitleBlock section={section} accentColor={titleColor ?? accent} showRule={showRule} />
      }
    >
      <SectionContent section={section} resume={resume} accent={accent} soft={soft} tone={tone} />
    </SectionHoverFrame>
  );
}
