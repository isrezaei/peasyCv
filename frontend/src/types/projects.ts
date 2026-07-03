import type { ID } from "./common";

export interface ProjectItem {
  id: ID;
  name: string;
  role: string;
  link: string;
  description: string;
}
