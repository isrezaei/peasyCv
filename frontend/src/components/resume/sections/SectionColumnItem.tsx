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
  /** Decorative colour (title rule, rails, bullets, meter fill); unset keeps
   *  each element's classic source. */
  markerColor?: string;
  showRule?: boolean;
  /** Light vs dark column — forwarded to the chips + dots control so they adapt. */
  tone?: "onLight" | "onDark";
  /**
   * Accepted for call-site compatibility. The HoverFrame is now ALWAYS the single
   * solid dots menu, so this no longer changes the control's form.
   */
  compact?: boolean;
  /** Pagination: subset of items to render; null = all. */
  itemIds?: string[] | null;
  /** Pagination: false on a continuation page — render content without the heading. */
  showTitle?: boolean;
}

/** A titled section block (title + content) for the column-based templates. */
export function SectionColumnItem({
  section,
  resume,
  accent,
  soft,
  titleColor,
  markerColor,
  showRule = false,
  tone = "onLight",
  itemIds,
  showTitle = true,
}: SectionColumnItemProps) {
  return (
    <SectionHoverFrame
      section={section}
      tone={tone}
      title={
        showTitle ? (
          <SectionTitleBlock
            section={section}
            accentColor={titleColor ?? accent}
            showRule={showRule}
            markerColor={markerColor}
          />
        ) : null
      }
    >
      <SectionContent
        section={section}
        resume={resume}
        accent={accent}
        soft={soft}
        tone={tone}
        marker={markerColor}
        itemIds={itemIds}
      />
    </SectionHoverFrame>
  );
}
