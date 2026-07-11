"use client";

import { Box, VStack } from "@chakra-ui/react";
import { CertificationItemBlock } from "@/components/resume/editor/CertificationItemBlock";
import { EducationItemBlock } from "@/components/resume/editor/EducationItemBlock";
import { ExperienceItemBlock } from "@/components/resume/editor/ExperienceItemBlock";
import { LanguageItemBlock } from "@/components/resume/editor/LanguageItemBlock";
import { ProjectItemBlock } from "@/components/resume/editor/ProjectItemBlock";
import { SkillGroupBlock } from "@/components/resume/editor/SkillGroupBlock";
import { SummaryBlock } from "@/components/resume/editor/SummaryBlock";
import { LANGUAGE_GRID_COLUMNS, WITHIN_SECTION_GAP_MM } from "@/lib/pagination";
import type { ResumeData, SectionMeta } from "@/types";

interface SectionContentProps {
  section: SectionMeta;
  resume: ResumeData;
  accent: string;
  soft: string;
  /** Light vs dark surrounding column — forwarded to the skill chips so they blend. */
  tone?: "onLight" | "onDark";
  /** Decorative colour (rails, bullets, meter fill); unset keeps each item's
   *  classic per-element source. */
  marker?: string;
  /**
   * Subset of item ids to render (in order), used by pagination so a section can
   * be split across pages. `null`/omitted renders every item (no split).
   */
  itemIds?: string[] | null;
}

/** Keep only the items this page carries, preserving the resume's item order. */
function slice<T extends { id: string }>(items: T[], itemIds: string[] | null | undefined): T[] {
  if (!itemIds) return items;
  const wanted = new Set(itemIds);
  return items.filter((item) => wanted.has(item.id));
}

/** Renders all items of a section (no title) for the column-based templates. */
export function SectionContent({
  section,
  resume,
  accent,
  tone = "onLight",
  marker,
  itemIds,
}: SectionContentProps) {
  const direction = section.direction;

  switch (section.type) {
    case "summary":
      return <SummaryBlock direction={direction} />;
    case "experience":
      return (
        <VStack align="stretch" gap="2">
          {slice(resume.experience, itemIds).map((item) => (
            <ExperienceItemBlock
              key={item.id}
              item={item}
              direction={direction}
              accentColor={accent}
              markerColor={marker}
              showMonth={section.showMonth}
              monthFormat={section.monthFormat}
            />
          ))}
        </VStack>
      );
    case "skills":
      return (
        <VStack align="stretch" gap="1">
          {slice(resume.skills, itemIds).map((group) => (
            <SkillGroupBlock key={group.id} group={group} direction={direction} tone={tone} />
          ))}
        </VStack>
      );
    case "education":
      return (
        <VStack align="stretch" gap="2">
          {slice(resume.education, itemIds).map((item) => (
            <EducationItemBlock
              key={item.id}
              item={item}
              direction={direction}
              accentColor={accent}
              markerColor={marker}
              showMonth={section.showMonth}
              monthFormat={section.monthFormat}
            />
          ))}
        </VStack>
      );
    case "projects":
      return (
        <VStack align="stretch" gap="2">
          {slice(resume.projects, itemIds).map((item) => (
            <ProjectItemBlock key={item.id} item={item} direction={direction} accentColor={accent} />
          ))}
        </VStack>
      );
    case "languages":
      // Same fixed-column grid the paginated canvas paints, re-chunked by the
      // SAME column constant — a page's itemIds arrive in whole rows, so the
      // rows re-form identically here. Row spacing mirrors the canvas's
      // within-section block gap.
      return (
        <Box
          dir={direction}
          display="grid"
          gridTemplateColumns={`repeat(${LANGUAGE_GRID_COLUMNS}, 1fr)`}
          columnGap="7"
          rowGap={`${WITHIN_SECTION_GAP_MM}mm`}
        >
          {slice(resume.languages, itemIds).map((item) => (
            <LanguageItemBlock
              key={item.id}
              item={item}
              direction={direction}
              meterVariant={section.languageMeterVariant}
              showMeter={section.languageShowMeter}
              showLevelText={section.languageShowLevelText}
              markerColor={marker}
            />
          ))}
        </Box>
      );
    case "certifications":
      return (
        <VStack align="stretch" gap="1.5">
          {slice(resume.certifications, itemIds).map((item) => (
            <CertificationItemBlock
              key={item.id}
              item={item}
              direction={direction}
              accentColor={accent}
            />
          ))}
        </VStack>
      );
    default:
      return null;
  }
}
