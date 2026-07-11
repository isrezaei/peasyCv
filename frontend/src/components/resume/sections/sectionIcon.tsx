import type { IconType } from "react-icons";
import {
  AchievementsIcon,
  CertificationsIcon,
  EducationIcon,
  ExperienceIcon,
  LanguagesIcon,
  ProjectsIcon,
  SkillsIcon,
  SummaryIcon,
} from "@/components/ui/icons";
import type { RemovableSectionType } from "@/types";

/**
 * One glyph per resume section type, used by the icon-chip heading variant ported
 * from the imported templates. Presentation-only: the icon never carries data, it
 * just labels a heading the same way the source design does.
 */
const SECTION_ICONS: Record<RemovableSectionType, IconType> = {
  summary: SummaryIcon,
  experience: ExperienceIcon,
  skills: SkillsIcon,
  education: EducationIcon,
  projects: ProjectsIcon,
  languages: LanguagesIcon,
  certifications: CertificationsIcon,
  achievements: AchievementsIcon,
};

export function getSectionIcon(type: RemovableSectionType): IconType {
  return SECTION_ICONS[type];
}
