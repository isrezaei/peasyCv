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
}

/** Renders all items of a section (no title) for the column-based templates. */
export function SectionContent({ section, resume, accent, tone = "onLight" }: SectionContentProps) {
  const direction = section.direction;

  switch (section.type) {
    case "summary":
      return <SummaryBlock direction={direction} />;
    case "experience":
      return (
        <VStack align="stretch" gap="2">
          {resume.experience.map((item) => (
            <ExperienceItemBlock key={item.id} item={item} direction={direction} accentColor={accent} />
          ))}
        </VStack>
      );
    case "skills":
      return (
        <VStack align="stretch" gap="1">
          {resume.skills.map((group) => (
            <SkillGroupBlock key={group.id} group={group} direction={direction} tone={tone} />
          ))}
        </VStack>
      );
    case "education":
      return (
        <VStack align="stretch" gap="2">
          {resume.education.map((item) => (
            <EducationItemBlock key={item.id} item={item} direction={direction} accentColor={accent} />
          ))}
        </VStack>
      );
    case "projects":
      return (
        <VStack align="stretch" gap="2">
          {resume.projects.map((item) => (
            <ProjectItemBlock key={item.id} item={item} direction={direction} accentColor={accent} />
          ))}
        </VStack>
      );
    case "languages":
      return (
        <VStack align="stretch" gap="1">
          {resume.languages.map((item) => (
            <LanguageItemBlock key={item.id} item={item} direction={direction} accentColor={accent} />
          ))}
        </VStack>
      );
    case "certifications":
      return (
        <VStack align="stretch" gap="1.5">
          {resume.certifications.map((item) => (
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
