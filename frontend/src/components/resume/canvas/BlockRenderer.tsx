import { Box } from "@chakra-ui/react";
import { AchievementItemBlock } from "@/components/resume/editor/AchievementItemBlock";
import { CertificationItemBlock } from "@/components/resume/editor/CertificationItemBlock";
import { EducationItemBlock } from "@/components/resume/editor/EducationItemBlock";
import { ExperienceItemBlock } from "@/components/resume/editor/ExperienceItemBlock";
import { LanguageItemBlock } from "@/components/resume/editor/LanguageItemBlock";
import { PersonalInfoBlock } from "@/components/resume/editor/PersonalInfoBlock";
import { ProjectItemBlock } from "@/components/resume/editor/ProjectItemBlock";
import { SectionTitleBlock } from "@/components/resume/editor/SectionTitleBlock";
import { SkillGroupBlock } from "@/components/resume/editor/SkillGroupBlock";
import { SummaryBlock } from "@/components/resume/editor/SummaryBlock";
import {
  ACHIEVEMENT_CELL_MIN_MM,
  ACHIEVEMENT_GRID_GAP_MM,
  LANGUAGE_GRID_COLUMNS,
  type PageBlock,
} from "@/lib/pagination";
import type { ResumeData } from "@/types";

interface BlockRendererProps {
  block: PageBlock;
  resume: ResumeData;
  accent: string;
  soft: string;
  /** Decorative colour (rails, rules, bullets, icons, meter fill); unset keeps
   *  each block's classic per-element source. */
  marker?: string;
}

export function BlockRenderer({ block, resume, accent, marker }: BlockRendererProps) {
  const section = block.sectionId
    ? resume.sections.find((candidate) => candidate.id === block.sectionId) ?? null
    : null;
  const direction = section?.direction ?? "rtl";

  switch (block.kind) {
    case "personalInfo":
      return <PersonalInfoBlock accentColor={accent} markerColor={marker} />;
    case "sectionTitle":
      return section ? (
        <SectionTitleBlock section={section} accentColor={accent} markerColor={marker} />
      ) : null;
    case "summary":
      return <SummaryBlock direction={direction} />;
    case "experienceItem": {
      const item = resume.experience.find((candidate) => candidate.id === block.refId);
      return item ? (
        <ExperienceItemBlock
          item={item}
          direction={direction}
          accentColor={accent}
          markerColor={marker}
          showMonth={section?.showMonth ?? true}
          monthFormat={section?.monthFormat ?? "name"}
        />
      ) : null;
    }
    case "skillGroup": {
      const group = resume.skills.find((candidate) => candidate.id === block.refId);
      return group ? <SkillGroupBlock group={group} direction={direction} /> : null;
    }
    case "educationItem": {
      const item = resume.education.find((candidate) => candidate.id === block.refId);
      return item ? (
        <EducationItemBlock
          item={item}
          direction={direction}
          accentColor={accent}
          markerColor={marker}
          showMonth={section?.showMonth ?? true}
          monthFormat={section?.monthFormat ?? "name"}
        />
      ) : null;
    }
    case "projectItem": {
      const item = resume.projects.find((candidate) => candidate.id === block.refId);
      return item ? (
        <ProjectItemBlock item={item} direction={direction} accentColor={accent} />
      ) : null;
    }
    case "languageRow": {
      const wanted = new Set(block.refIds ?? []);
      const items = resume.languages.filter((candidate) => wanted.has(candidate.id));
      return section && items.length > 0 ? (
        <Box
          dir={direction}
          display="grid"
          gridTemplateColumns={`repeat(${LANGUAGE_GRID_COLUMNS}, 1fr)`}
          columnGap="7"
        >
          {items.map((item) => (
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
      ) : null;
    }
    case "certificationItem": {
      const item = resume.certifications.find((candidate) => candidate.id === block.refId);
      return item ? (
        <CertificationItemBlock item={item} direction={direction} accentColor={accent} />
      ) : null;
    }
    case "achievementRow": {
      const wanted = new Set(block.refIds ?? []);
      const items = resume.achievements.filter((candidate) => wanted.has(candidate.id));
      return section && items.length > 0 ? (
        <Box
          dir={direction}
          display="grid"
          gridTemplateColumns={`repeat(auto-fill, minmax(min(${ACHIEVEMENT_CELL_MIN_MM}mm, 100%), 1fr))`}
          columnGap={`${ACHIEVEMENT_GRID_GAP_MM}mm`}
        >
          {items.map((item) => (
            <AchievementItemBlock
              key={item.id}
              item={item}
              direction={direction}
              accentColor={accent}
              markerColor={marker}
              showDescription={section.achievementShowDescription}
              showIcon={section.achievementShowIcons}
            />
          ))}
        </Box>
      ) : null;
    }
    default:
      return null;
  }
}
