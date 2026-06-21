import type { ID } from "./common";

export interface SkillItem {
  id: ID;
  name: string;
}

export interface SkillGroup {
  id: ID;
  name: string;
  skills: SkillItem[];
}
