import { CertificationItemBlock } from "@/components/resume/editor/CertificationItemBlock";
import { EducationItemBlock } from "@/components/resume/editor/EducationItemBlock";
import { ExperienceItemBlock } from "@/components/resume/editor/ExperienceItemBlock";
import { LanguageItemBlock } from "@/components/resume/editor/LanguageItemBlock";
import { PersonalInfoBlock } from "@/components/resume/editor/PersonalInfoBlock";
import { ProjectItemBlock } from "@/components/resume/editor/ProjectItemBlock";
import { SectionTitleBlock } from "@/components/resume/editor/SectionTitleBlock";
import { SkillGroupBlock } from "@/components/resume/editor/SkillGroupBlock";
import { SummaryBlock } from "@/components/resume/editor/SummaryBlock";
import type { PageBlock } from "@/lib/pagination";
import type { ResumeData } from "@/types";

interface BlockRendererProps {
  block: PageBlock;
  resume: ResumeData;
  accent: string;
  soft: string;
}

export function BlockRenderer({ block, resume, accent }: BlockRendererProps) {
  const section = block.sectionId
    ? resume.sections.find((candidate) => candidate.id === block.sectionId) ?? null
    : null;
  const direction = section?.direction ?? "rtl";

  switch (block.kind) {
    case "personalInfo":
      return <PersonalInfoBlock accentColor={accent} />;
    case "sectionTitle":
      return section ? <SectionTitleBlock section={section} accentColor={accent} /> : null;
    case "summary":
      return <SummaryBlock direction={direction} />;
    case "experienceItem": {
      const item = resume.experience.find((candidate) => candidate.id === block.refId);
      return item ? (
        <ExperienceItemBlock item={item} direction={direction} accentColor={accent} />
      ) : null;
    }
    case "skillGroup": {
      const group = resume.skills.find((candidate) => candidate.id === block.refId);
      return group ? <SkillGroupBlock group={group} direction={direction} /> : null;
    }
    case "educationItem": {
      const item = resume.education.find((candidate) => candidate.id === block.refId);
      return item ? (
        <EducationItemBlock item={item} direction={direction} accentColor={accent} />
      ) : null;
    }
    case "projectItem": {
      const item = resume.projects.find((candidate) => candidate.id === block.refId);
      return item ? (
        <ProjectItemBlock item={item} direction={direction} accentColor={accent} />
      ) : null;
    }
    case "languageItem": {
      const item = resume.languages.find((candidate) => candidate.id === block.refId);
      return item ? (
        <LanguageItemBlock item={item} direction={direction} accentColor={accent} />
      ) : null;
    }
    case "certificationItem": {
      const item = resume.certifications.find((candidate) => candidate.id === block.refId);
      return item ? (
        <CertificationItemBlock item={item} direction={direction} accentColor={accent} />
      ) : null;
    }
    default:
      return null;
  }
}
