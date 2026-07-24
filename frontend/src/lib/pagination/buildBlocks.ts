import type { ResumeData, SectionMeta } from "@/types";
import {
  estimateAchievementItemHeight,
  estimateCertificationItemHeight,
  estimateEducationItemHeight,
  estimateExperienceItemParts,
  estimateLanguageRowHeight,
  estimatePersonalInfoHeight,
  estimatePlainSkillGroupParts,
  estimateProjectItemHeight,
  estimateSectionTitleHeight,
  estimateSkillGroupHeight,
  estimateSummaryHeight,
} from "./estimateHeight";
import {
  achievementGridColumns,
  languageGridColumns,
  PROJECT_GRID_ROW_GAP_MM,
  projectGridColumns,
  SECTION_MIN_HEIGHT_MM,
} from "./constants";
import type { LayoutMetrics } from "./metrics";
import type { BlockKind, PageBlock } from "./types";

function buildSectionTitleBlock(
  resume: ResumeData,
  section: SectionMeta,
  hasContent: boolean,
  m: LayoutMetrics,
): PageBlock {
  // The SAME predicate SectionTitleIcon renders under: with the resume-wide
  // toggle on, the 1.6em icon chip governs the title row's height (except the
  // achievements heading, which never shows an icon, and ATS mode, which strips
  // every icon), so the title reserve prices the icon-governed row.
  const withIcon =
    resume.theme.showSectionIcons && !resume.theme.atsMode && section.type !== "achievements";
  return {
    id: `title-${section.id}`,
    kind: "sectionTitle",
    sectionId: section.id,
    refId: null,
    // The opt-in title separator is an absolute overlay inside the title area's
    // existing corridor (zero in-flow height), so the title reserve is the same
    // whether it is on or off.
    heightMm: estimateSectionTitleHeight(m, hasContent, withIcon),
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
  const withSeparator = resume.theme.showSectionSeparators && !resume.theme.atsMode;
  const blocks = buildSectionBlockList(resume, section, m);

  // Per-section min-height stabilizer: with separators on, SectionFrame paints a
  // titled section at least SECTION_MIN_HEIGHT_MM tall (CSS min-height — never
  // clipping, taller content just grows). Mirror it here by flooring the
  // section's summed reserve at the SAME constant: the shortfall lands on the
  // LAST block, so a floored (short) section still packs as one unit. A section
  // taller than the floor is untouched, and a section that splits across pages
  // was by definition taller than the floor, so its runs never carry shortfall.
  if (withSeparator && blocks.length > 0) {
    const totalMm = blocks.reduce(
      (sum, block, index) => sum + block.heightMm + (index > 0 ? block.gapBeforeMm : 0),
      0,
    );
    const shortfallMm = SECTION_MIN_HEIGHT_MM - totalMm;
    if (shortfallMm > 0) {
      const last = blocks[blocks.length - 1];
      blocks[blocks.length - 1] = { ...last, heightMm: last.heightMm + shortfallMm };
    }
  }
  return blocks;
}

function buildSectionBlockList(
  resume: ResumeData,
  section: SectionMeta,
  m: LayoutMetrics,
): PageBlock[] {
  switch (section.type) {
    case "summary": {
      return [
        buildSectionTitleBlock(resume, section, true, m),
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
        buildSectionTitleBlock(resume, section, hasContent, m),
        ...resume.experience.map((item) => {
          const parts = estimateExperienceItemParts(item, section, m);
          return {
            id: `experience-${item.id}`,
            kind: "experienceItem" as BlockKind,
            sectionId: section.id,
            refId: item.id,
            heightMm: parts.totalMm,
            keepWithNext: false,
            gapBeforeMm: m.withinGapMm,
            // A multi-bullet entry may be broken BETWEEN bullets by the packer
            // when it is taller than a whole page (it could never fit anywhere
            // as one unit — the unsplittable-oversize overflow). Entries that
            // fit a page are never split, so ordinary layouts are unchanged.
            split:
              item.responsibilities.length > 1
                ? {
                    headMm: parts.headMm,
                    listTopMm: parts.listTopMm,
                    unitMm: parts.bulletMm,
                    dateColumnMm: parts.dateColumnMm,
                    tailMm: parts.tailMm,
                  }
                : undefined,
          };
        }),
      ];
    }
    case "skills": {
      const hasContent = resume.skills.length > 0;
      return [
        buildSectionTitleBlock(resume, section, hasContent, m),
        ...resume.skills.map((group) => {
          // The plain panel list flows: each group carries split pricing so a
          // long list runs out the bottom of a page and continues on the next
          // (splitToFill), rather than jumping whole and stranding a column hole.
          // Every other skill mode keeps the single move-whole block.
          if (m.plainSkillList && group.skills.length > 1) {
            const parts = estimatePlainSkillGroupParts(group, m);
            return {
              id: `skills-${group.id}`,
              kind: "skillGroup" as BlockKind,
              sectionId: section.id,
              refId: group.id,
              heightMm: parts.totalMm,
              keepWithNext: false,
              gapBeforeMm: m.withinGapMm,
              split: {
                headMm: parts.headMm,
                listTopMm: 0,
                unitMm: parts.unitMm,
                dateColumnMm: 0,
                tailMm: parts.tailMm,
                splitToFill: true,
              },
            };
          }
          return {
            id: `skills-${group.id}`,
            kind: "skillGroup" as BlockKind,
            sectionId: section.id,
            refId: group.id,
            heightMm: estimateSkillGroupHeight(group, section, m),
            keepWithNext: false,
            gapBeforeMm: m.withinGapMm,
          };
        }),
      ];
    }
    case "education": {
      const hasContent = resume.education.length > 0;
      return [
        buildSectionTitleBlock(resume, section, hasContent, m),
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
      // The 2-up sub-grid flow (timeline-panel): the pagination unit is one ROW
      // of the grid, exactly like the achievements/languages grids — the packer
      // can only break between rows, where the painted grid breaks. Every other
      // template keeps the one-per-row blocks unchanged.
      if (m.projectsGrid) {
        const cols = projectGridColumns(m.contentWidthMm);
        const rows: (typeof resume.projects)[] = [];
        for (let i = 0; i < resume.projects.length; i += cols) {
          rows.push(resume.projects.slice(i, i + cols));
        }
        return [
          buildSectionTitleBlock(resume, section, hasContent, m),
          ...rows.map((row, index) => ({
            id: `project-row-${row[0].id}`,
            kind: "projectItem" as BlockKind,
            sectionId: section.id,
            refId: null,
            refIds: row.map((item) => item.id),
            // Cells differ per item, so a row reserves its TALLEST member.
            heightMm: Math.max(...row.map((item) => estimateProjectItemHeight(item, m, cols))),
            keepWithNext: false,
            // The first row keeps the shared title→content gap; later rows carry
            // the grid's own painted row gap.
            gapBeforeMm: index === 0 ? m.withinGapMm : PROJECT_GRID_ROW_GAP_MM,
          })),
        ];
      }
      return [
        buildSectionTitleBlock(resume, section, hasContent, m),
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
      // Languages render as a width-adaptive grid, so the pagination unit is
      // one ROW of the grid, not one language — the packer can only break
      // between rows, exactly where the painted grid breaks. The column count
      // is width-derived (3-up at full width, 2-up / stacked in a narrow
      // column) from the SAME helper the CSS auto-fill grid mirrors — the
      // achievements mechanism.
      const cols = languageGridColumns(m.contentWidthMm);
      const rows: (typeof resume.languages)[] = [];
      for (let i = 0; i < resume.languages.length; i += cols) {
        rows.push(resume.languages.slice(i, i + cols));
      }
      // Display settings are section-wide, so every row shares one height.
      const rowHeightMm = estimateLanguageRowHeight(section, m);
      return [
        buildSectionTitleBlock(resume, section, hasContent, m),
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
        buildSectionTitleBlock(resume, section, hasContent, m),
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
        buildSectionTitleBlock(resume, section, hasContent, m),
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
