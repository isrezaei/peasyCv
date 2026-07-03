"use client";

import { SectionHoverFrame } from "@/components/resume/editor/SectionHoverFrame";
import type { ResumeData, SectionMeta } from "@/types";
import { SectionContent } from "./SectionContent";
import { SectionHeading, type SectionHeadingVariant } from "./SectionHeading";

interface TemplateSectionProps {
  section: SectionMeta;
  resume: ResumeData;
  /** Accent fed to the section content (item titles, rails, dots, chips). */
  accent: string;
  soft: string;
  /** Heading colour when it differs from the content accent (e.g. a dark aside). */
  titleColor?: string;
  variant?: SectionHeadingVariant;
  tone?: "onLight" | "onDark";
  chipColor?: string;
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

/**
 * A titled, fully-editable section for the imported templates: the same
 * {@link SectionHoverFrame} (add / remove / settings controls + reveal-on-hover)
 * and {@link SectionContent} (inline editing of every entry) as the original
 * column templates, but with the pluggable {@link SectionHeading} treatments the
 * new designs need. Presentation-only — it owns no data.
 */
export function TemplateSection({
  section,
  resume,
  accent,
  soft,
  titleColor,
  variant = "rule",
  tone = "onLight",
  chipColor,
  itemIds,
  showTitle = true,
}: TemplateSectionProps) {
  return (
    <SectionHoverFrame
      section={section}
      tone={tone}
      title={
        showTitle ? (
          <SectionHeading
            section={section}
            accentColor={titleColor ?? accent}
            variant={variant}
            tone={tone}
            chipColor={chipColor}
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
        itemIds={itemIds}
      />
    </SectionHoverFrame>
  );
}
