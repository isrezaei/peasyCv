import type { Direction, ID } from "./common";

export type RemovableSectionType =
  | "summary"
  | "experience"
  | "skills"
  | "education"
  | "projects"
  | "languages"
  | "certifications";

export type SectionType = "personalInfo" | RemovableSectionType;

export interface SectionMeta {
  id: ID;
  type: RemovableSectionType;
  title: string;
  visible: boolean;
  direction: Direction;
  order: number;
}
