import type { ResumeData, SectionMeta } from "@/types";
import {
  estimateAchievementItemHeight,
  estimateCertificationItemHeight,
  estimateEducationItemHeight,
  estimateExperienceItemHeight,
  estimateLanguageRowHeight,
  estimatePersonalInfoHeight,
  estimateProjectItemHeight,
  estimateSectionTitleHeight,
  estimateSkillGroupHeight,
  estimateSummaryHeight,
} from "./estimateHeight";
import { achievementGridColumns, LANGUAGE_GRID_COLUMNS } from "./constants";
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

export function buildSectionBlocks(
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
          heightMm: estimateExperienceItemHeight(item, section, m),
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
          heightMm: estimateEducationItemHeight(item, section, m),
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
      // Languages render as a fixed-column grid, so the pagination unit is one
      // ROW of the grid, not one language — the packer can only break between
      // rows, exactly where the painted grid breaks.
      const rows: (typeof resume.languages)[] = [];
      for (let i = 0; i < resume.languages.length; i += LANGUAGE_GRID_COLUMNS) {
        rows.push(resume.languages.slice(i, i + LANGUAGE_GRID_COLUMNS));
      }
      // Display settings are section-wide, so every row shares one height.
      const rowHeightMm = estimateLanguageRowHeight(section, m);
      return [
        buildSectionTitleBlock(section, hasContent, m),
        ...rows.map((row) => ({
          id: `language-row-${row[0].id}`,
          kind: "languageRow" as BlockKind,
          sectionId: section.id,
          refId: null,
          refIds: row.map((item) => item.id),
          heightMm: rowHeightMm,
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
    case "achievements": {
      const hasContent = resume.achievements.length > 0;
      // Like the languages grid, the pagination unit is one ROW — the packer
      // can only break between rows, exactly where the painted grid breaks.
      // The column count is width-derived (2-up at full width, stacked in a
      // narrow column) from the SAME helper the CSS auto-fill grid mirrors.
      const cols = achievementGridColumns(m.contentWidthMm);
      const rows: (typeof resume.achievements)[] = [];
      for (let i = 0; i < resume.achievements.length; i += cols) {
        rows.push(resume.achievements.slice(i, i + cols));
      }
      return [
        buildSectionTitleBlock(section, hasContent, m),
        ...rows.map((row) => ({
          id: `achievement-row-${row[0].id}`,
          kind: "achievementRow" as BlockKind,
          sectionId: section.id,
          refId: null,
          refIds: row.map((item) => item.id),
          // Descriptions differ per item, so a row reserves its TALLEST member
          // (unlike the uniform languages row).
          heightMm: Math.max(
            ...row.map((item) => estimateAchievementItemHeight(item, section, m, cols)),
          ),
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
