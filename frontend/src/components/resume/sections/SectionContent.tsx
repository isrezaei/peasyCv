"use client";

import { VStack } from "@chakra-ui/react";
import { CertificationItemBlock } from "@/components/resume/editor/CertificationItemBlock";
import { EducationItemBlock } from "@/components/resume/editor/EducationItemBlock";
import { ExperienceItemBlock } from "@/components/resume/editor/ExperienceItemBlock";
import { LanguageItemBlock } from "@/components/resume/editor/LanguageItemBlock";
import { ProjectItemBlock } from "@/components/resume/editor/ProjectItemBlock";
import { SkillGroupBlock } from "@/components/resume/editor/SkillGroupBlock";
import { SummaryBlock } from "@/components/resume/editor/SummaryBlock";
import type { ResumeData, SectionMeta } from "@/types";

interface SectionContentProps {
  section: SectionMeta;
  resume: ResumeData;
  accent: string;
  soft: string;
  /** Light vs dark surrounding column — forwarded to the skill chips so they blend. */
  tone?: "onLight" | "onDark";
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
            <ExperienceItemBlock key={item.id} item={item} direction={direction} accentColor={accent} />
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
            <EducationItemBlock key={item.id} item={item} direction={direction} accentColor={accent} />
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
      return (
        <VStack align="stretch" gap="1">
          {slice(resume.languages, itemIds).map((item) => (
            <LanguageItemBlock key={item.id} item={item} direction={direction} accentColor={accent} />
          ))}
        </VStack>
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
