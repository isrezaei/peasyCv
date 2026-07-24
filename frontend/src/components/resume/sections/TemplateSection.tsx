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
  /** `chip` variant geometry — forwarded to the heading so a template can pin the
   *  icon-square size/radius to a design's exact values. */
  chipSize?: string;
  chipRadius?: string;
  /** `chip` variant: explicit icon-square fill that wins over the marker/chipColor
   *  fallback (keeps it a light header-harmonised wash under a vivid palette). */
  chipBg?: string;
  /** Decorative colour (heading treatment, rails, bullets, meter fill); unset
   *  keeps each element's classic source. */
  markerColor?: string;
  /**
   * Accepted for call-site compatibility. The HoverFrame is now ALWAYS the single
   * solid dots menu, so this no longer changes the control's form.
   */
  compact?: boolean;
  /** Pagination: subset of items to render; null = all. */
  itemIds?: string[] | null;
  /** Pagination: false on a continuation page — render content without the heading. */
  showTitle?: boolean;
  /** Pagination: split-part slices for entries broken between bullet rows
   *  (see ColumnSectionRun.itemSlices); absent items render whole. */
  itemSlices?: Record<string, { start: number; end: number; continuation: boolean }>;
  /** When set, the Skills section renders as filled pills of this colour (see
   *  SectionContent.skillChipFill); unset keeps the shared underline tags. */
  skillChipFill?: string;
  /** Forwarded to SectionContent — narrow-column stacked dated entries. */
  stackedEntries?: boolean;
  /** Forwarded to SectionContent — the timeline-panel 2-up projects sub-grid. */
  projectsGrid?: boolean;
  /** Forwarded to SectionContent — one-row «name … issuer · date» certifications. */
  certInlineMeta?: boolean;
  /** Forwarded to SectionContent — bare (marker-less) skills-list rows. */
  skillsPlainList?: boolean;
  /** Forwarded to SectionContent — pinned summary prose size. */
  summaryFontSize?: string;
  /** Forwarded to SectionContent — prose line-heights pinned by the design. */
  proseLineHeights?: { summary?: string; body?: string; achievement?: string };
  /** Forwarded to SectionContent — plain-bullet Key-Achievements. */
  achievementBullets?: boolean;
  /** Heading typography overrides (see {@link SectionHeading}); unset keeps the
   *  shared scale. */
  titleFontSize?: string;
  titleFontWeight?: string;
  titleLetterSpacing?: string;
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
  chipSize,
  chipRadius,
  chipBg,
  markerColor,
  itemIds,
  showTitle = true,
  itemSlices,
  skillChipFill,
  stackedEntries,
  projectsGrid,
  certInlineMeta,
  skillsPlainList,
  summaryFontSize,
  proseLineHeights,
  achievementBullets,
  titleFontSize,
  titleFontWeight,
  titleLetterSpacing,
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
            chipSize={chipSize}
            chipRadius={chipRadius}
            chipBg={chipBg}
            markerColor={markerColor}
            fontSize={titleFontSize}
            fontWeight={titleFontWeight}
            letterSpacing={titleLetterSpacing}
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
        itemSlices={itemSlices}
        skillChipFill={skillChipFill}
        stackedEntries={stackedEntries}
        projectsGrid={projectsGrid}
        certInlineMeta={certInlineMeta}
        skillsPlainList={skillsPlainList}
        summaryFontSize={summaryFontSize}
        proseLineHeights={proseLineHeights}
        achievementBullets={achievementBullets}
      />
    </SectionHoverFrame>
  );
}
