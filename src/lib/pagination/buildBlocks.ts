import type { ResumeData, SectionMeta } from "@/types";
import {
  estimateCertificationItemHeight,
  estimateEducationItemHeight,
  estimateExperienceItemHeight,
  estimateLanguageItemHeight,
  estimatePersonalInfoHeight,
  estimateProjectItemHeight,
  estimateSectionTitleHeight,
  estimateSkillGroupHeight,
  estimateSummaryHeight,
} from "./estimateHeight";
import type { LayoutMetrics } from "./metrics";
import type { BlockKind, PageBlock } from "./types";

function buildSectionTitleBlock(
  section: SectionMeta,
  hasContent: boolean,
  m: LayoutMetrics,
): PageBlock {
  return {
    id: `title-${section.id}`,
    kind: "sectionTitle",
    sectionId: section.id,
    refId: null,
    heightMm: estimateSectionTitleHeight(m, hasContent),
    // Keep a heading attached to its first entry so it never strands at a page foot.
    keepWithNext: hasContent,
    // A heading opens a new section, so it carries the large between-section gap.
    gapBeforeMm: m.sectionGapMm,
  };
}

function buildSectionBlocks(
  resume: ResumeData,
  section: SectionMeta,
  m: LayoutMetrics,
): PageBlock[] {
  switch (section.type) {
    case "summary": {
      return [
        buildSectionTitleBlock(section, true, m),
        {
          id: `summary-${section.id}`,
          kind: "summary" as BlockKind,
          sectionId: section.id,
          refId: null,
          heightMm: estimateSummaryHeight(resume.summary.html, m),
          keepWithNext: false,
          gapBeforeMm: m.withinGapMm,
        },
      ];
    }
    case "experience": {
      const hasContent = resume.experience.length > 0;
      return [
        buildSectionTitleBlock(section, hasContent, m),
        ...resume.experience.map((item) => ({
          id: `experience-${item.id}`,
          kind: "experienceItem" as BlockKind,
          sectionId: section.id,
          refId: item.id,
          heightMm: estimateExperienceItemHeight(item, m),
          keepWithNext: false,
          gapBeforeMm: m.withinGapMm,
        })),
      ];
    }
    case "skills": {
      const hasContent = resume.skills.length > 0;
      return [
        buildSectionTitleBlock(section, hasContent, m),
        ...resume.skills.map((group) => ({
          id: `skills-${group.id}`,
          kind: "skillGroup" as BlockKind,
          sectionId: section.id,
          refId: group.id,
          heightMm: estimateSkillGroupHeight(group, m),
          keepWithNext: false,
          gapBeforeMm: m.withinGapMm,
        })),
      ];
    }
    case "education": {
      const hasContent = resume.education.length > 0;
      return [
        buildSectionTitleBlock(section, hasContent, m),
        ...resume.education.map((item) => ({
          id: `education-${item.id}`,
          kind: "educationItem" as BlockKind,
          sectionId: section.id,
          refId: item.id,
          heightMm: estimateEducationItemHeight(item, m),
          keepWithNext: false,
          gapBeforeMm: m.withinGapMm,
        })),
      ];
    }
    case "projects": {
      const hasContent = resume.projects.length > 0;
      return [
        buildSectionTitleBlock(section, hasContent, m),
        ...resume.projects.map((item) => ({
          id: `project-${item.id}`,
          kind: "projectItem" as BlockKind,
          sectionId: section.id,
          refId: item.id,
          heightMm: estimateProjectItemHeight(item, m),
          keepWithNext: false,
          gapBeforeMm: m.withinGapMm,
        })),
      ];
    }
    case "languages": {
      const hasContent = resume.languages.length > 0;
      return [
        buildSectionTitleBlock(section, hasContent, m),
        ...resume.languages.map((item) => ({
          id: `language-${item.id}`,
          kind: "languageItem" as BlockKind,
          sectionId: section.id,
          refId: item.id,
          heightMm: estimateLanguageItemHeight(m),
          keepWithNext: false,
          gapBeforeMm: m.withinGapMm,
        })),
      ];
    }
    case "certifications": {
      const hasContent = resume.certifications.length > 0;
      return [
        buildSectionTitleBlock(section, hasContent, m),
        ...resume.certifications.map((item) => ({
          id: `certification-${item.id}`,
          kind: "certificationItem" as BlockKind,
          sectionId: section.id,
          refId: item.id,
          heightMm: estimateCertificationItemHeight(m),
          keepWithNext: false,
          gapBeforeMm: m.withinGapMm,
        })),
      ];
    }
    default:
      return [];
  }
}

export function buildBlocks(resume: ResumeData, m: LayoutMetrics): PageBlock[] {
  const personalInfoBlock: PageBlock = {
    id: "personal-info",
    kind: "personalInfo",
    sectionId: null,
    refId: null,
    heightMm: estimatePersonalInfoHeight(resume.personalInfo, m),
    keepWithNext: true,
    // The header is always the first block on page one, so its gap is unused.
    gapBeforeMm: 0,
  };

  const visibleSections = resume.sections
    .filter((section) => section.visible)
    .slice()
    .sort((a, b) => a.order - b.order);

  const sectionBlocks = visibleSections.flatMap((section) =>
    buildSectionBlocks(resume, section, m),
  );

  return [personalInfoBlock, ...sectionBlocks];
}
