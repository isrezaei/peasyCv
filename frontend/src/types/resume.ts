import type { ID, Timestamped } from "./common";
import type { CertificationItem } from "./certifications";
import type { EducationItem } from "./education";
import type { ExperienceItem } from "./experience";
import type { LanguageItem } from "./languages";
import type { PersonalInfo } from "./personal-info";
import type { ProjectItem } from "./projects";
import type { SectionMeta } from "./sections";
import type { SkillGroup } from "./skills";
import type { SummaryContent } from "./summary";
import type { TemplateId } from "./template";
import type { ThemeSettings } from "./theme";

export interface ResumeData extends Timestamped {
  id: ID;
  title: string;
  locale: "fa" | "en";
  templateId: TemplateId;
  theme: ThemeSettings;
  sections: SectionMeta[];
  personalInfo: PersonalInfo;
  summary: SummaryContent;
  experience: ExperienceItem[];
  skills: SkillGroup[];
  education: EducationItem[];
  projects: ProjectItem[];
  languages: LanguageItem[];
  certifications: CertificationItem[];
}
