"use client";

import { Box, VStack } from "@chakra-ui/react";
import { AchievementItemBlock } from "@/components/resume/editor/AchievementItemBlock";
import { CertificationItemBlock } from "@/components/resume/editor/CertificationItemBlock";
import { EducationItemBlock } from "@/components/resume/editor/EducationItemBlock";
import { ExperienceItemBlock } from "@/components/resume/editor/ExperienceItemBlock";
import { LanguageItemBlock } from "@/components/resume/editor/LanguageItemBlock";
import { ProjectItemBlock } from "@/components/resume/editor/ProjectItemBlock";
import { SkillGroupBlock } from "@/components/resume/editor/SkillGroupBlock";
import { SummaryBlock } from "@/components/resume/editor/SummaryBlock";
import {
  ACHIEVEMENT_CELL_MIN_MM,
  ACHIEVEMENT_GRID_GAP_MM,
  LANGUAGE_CELL_MIN_MM,
  LANGUAGE_GRID_GAP_MM,
  PROJECT_CELL_MIN_MM,
  PROJECT_GRID_COL_GAP_MM,
  PROJECT_GRID_ROW_GAP_MM,
  WITHIN_SECTION_GAP_MM,
} from "@/lib/pagination";
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
  /**
   * Split-part slices for experience entries the packer broke BETWEEN bullet
   * rows (an entry taller than a whole page): the bullet range this page
   * renders and whether it is a title-less continuation. Absent items render
   * whole.
   */
  itemSlices?: Record<string, { start: number; end: number; continuation: boolean }>;
  /**
   * When set, the Skills section renders as FILLED PILLS of this colour (with the
   * reference's wider inter-group gap) instead of the shared underline tags — the
   * header-band template passes its harmonised card wash. Unset → underline.
   */
  skillChipFill?: string;
  /**
   * Paint DATED entries stacked (period above the title) instead of in the fixed
   * date column — the narrow-column composition the timeline-panel design uses in
   * its side panel. Must match the flow's `LayoutMetrics.stackedEntries`.
   */
  stackedEntries?: boolean;
  /** Paint Projects as the timeline-panel 2-up sub-grid.
   *  Must match the flow's `LayoutMetrics.projectsGrid`. */
  projectsGrid?: boolean;
  /** Paint certifications as ONE «name … issuer · date» row.
   *  Must match the flow's `LayoutMetrics.certInlineMeta`. */
  certInlineMeta?: boolean;
  /** Paint skills-list rows bare (no markers, the reference's panel lines).
   *  Must match the flow's `LayoutMetrics.plainSkillList`. */
  skillsPlainList?: boolean;
  /** Summary prose size, when pinned away from the shared scale.
   *  Must match the flow's `LayoutMetrics.summaryEm`. */
  summaryFontSize?: string;
  /**
   * PROSE line-heights pinned away from the theme's slider, because the imported
   * design specifies them per tier. Must match `LayoutMetrics.proseLineHeights`.
   */
  proseLineHeights?: { summary?: string; body?: string; achievement?: string };
  /** Paint Key-Achievements as a plain bullet list (the reference's `<ul>`).
   *  Must match the flow's `LayoutMetrics.achievementBullets`. */
  achievementBullets?: boolean;
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
  itemSlices,
  skillChipFill,
  stackedEntries,
  projectsGrid,
  certInlineMeta,
  skillsPlainList,
  summaryFontSize,
  proseLineHeights,
  achievementBullets,
}: SectionContentProps) {
  const direction = section.direction;

  switch (section.type) {
    case "summary":
      return (
        <SummaryBlock
          direction={direction}
          fontSize={summaryFontSize}
          lineHeight={proseLineHeights?.summary}
        />
      );
    case "experience":
      return (
        <VStack align="stretch" gap="2">
          {slice(resume.experience, itemIds).map((item) => {
            const part = itemSlices?.[item.id];
            return (
              <ExperienceItemBlock
                key={item.id}
                item={item}
                direction={direction}
                accentColor={accent}
                markerColor={marker}
                showMonth={section.showMonth}
                monthFormat={section.monthFormat}
                respRange={part ? { start: part.start, end: part.end } : undefined}
                continuation={part?.continuation}
                stacked={stackedEntries}
                proseLineHeight={proseLineHeights?.body}
              />
            );
          })}
        </VStack>
      );
    case "skills":
      // Filled-pill mode uses the reference's 11px gap between skill groups; the
      // shared underline mode keeps its tighter rhythm.
      return (
        <VStack align="stretch" gap={skillChipFill ? "11px" : "1"}>
          {slice(resume.skills, itemIds).map((group) => {
            // A plain list broken across pages carries a per-group slice (the
            // packer's splitToFill parts); absent groups render whole.
            const part = itemSlices?.[group.id];
            return (
              <SkillGroupBlock
                key={group.id}
                group={group}
                direction={direction}
                tone={tone}
                accentColor={accent}
                markerColor={marker}
                displayMode={section.skillDisplayMode}
                showLevel={section.skillShowLevel}
                meterVariant={section.skillMeterVariant}
                chipFill={skillChipFill}
                plainList={skillsPlainList}
                skillRange={part ? { start: part.start, end: part.end } : undefined}
                continuation={part?.continuation}
              />
            );
          })}
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
              stacked={stackedEntries}
            />
          ))}
        </VStack>
      );
    case "projects":
      // The timeline-panel 2-up sub-grid: auto-fill against the SAME mm minimum
      // the packer's `projectGridColumns` mirrors (2-up at the design's main
      // column, stacked anywhere narrower), with the reference's 26px column /
      // 12px row gap. Packed rows re-form identically because a page's itemIds
      // arrive in whole rows — the achievements-grid mechanism.
      if (projectsGrid) {
        return (
          <Box
            dir={direction}
            display="grid"
            gridTemplateColumns={`repeat(auto-fill, minmax(min(${PROJECT_CELL_MIN_MM}mm, 100%), 1fr))`}
            columnGap={`${PROJECT_GRID_COL_GAP_MM}mm`}
            rowGap={`${PROJECT_GRID_ROW_GAP_MM}mm`}
          >
            {slice(resume.projects, itemIds).map((item) => (
              <ProjectItemBlock
                key={item.id}
                item={item}
                direction={direction}
                accentColor={accent}
                gridCell
                proseLineHeight={proseLineHeights?.body}
              />
            ))}
          </Box>
        );
      }
      return (
        <VStack align="stretch" gap="2">
          {slice(resume.projects, itemIds).map((item) => (
            <ProjectItemBlock key={item.id} item={item} direction={direction} accentColor={accent} />
          ))}
        </VStack>
      );
    case "languages":
      // Width-adaptive grid: auto-fill against the SAME mm minimum the packer's
      // `languageGridColumns` mirrors (3-up at full width, 2-up / stacked in a
      // narrow column, so cells can never spill out of the section box) — and
      // the packed rows re-form identically because a page's itemIds arrive in
      // whole rows. Row spacing mirrors the canvas's within-section block gap.
      return (
        <Box
          dir={direction}
          display="grid"
          gridTemplateColumns={`repeat(auto-fill, minmax(min(${LANGUAGE_CELL_MIN_MM}mm, 100%), 1fr))`}
          columnGap={`${LANGUAGE_GRID_GAP_MM}mm`}
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
              // In a narrow column the cell stacks vertically with a compact
              // meter — the same flag that stacks the dated entries.
              stacked={stackedEntries}
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
              inlineMeta={certInlineMeta}
              showMonth={section.showMonth}
              monthFormat={section.monthFormat}
            />
          ))}
        </VStack>
      );
    case "achievements":
      // Width-adaptive grid: auto-fill against the SAME mm minimum the packer's
      // `achievementGridColumns` mirrors, so a full-width flow paints 2-up and a
      // narrow column stacks — and the packed rows re-form identically because a
      // page's itemIds arrive in whole rows. Row spacing mirrors the canvas's
      // within-section block gap (the languages-grid pattern).
      return (
        <Box
          dir={direction}
          display="grid"
          gridTemplateColumns={`repeat(auto-fill, minmax(min(${ACHIEVEMENT_CELL_MIN_MM}mm, 100%), 1fr))`}
          columnGap={`${ACHIEVEMENT_GRID_GAP_MM}mm`}
          rowGap={`${WITHIN_SECTION_GAP_MM}mm`}
        >
          {slice(resume.achievements, itemIds).map((item) => (
            <AchievementItemBlock
              key={item.id}
              item={item}
              direction={direction}
              accentColor={accent}
              markerColor={marker}
              showDescription={section.achievementShowDescription}
              showIcon={section.achievementShowIcons}
              plainBullet={achievementBullets}
              lineHeight={proseLineHeights?.achievement}
            />
          ))}
        </Box>
      );
    default:
      return null;
  }
}
