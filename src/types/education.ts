import type { ID } from "./common";

export interface EducationItem {
  id: ID;
  degree: string;
  university: string;
  startDate: string;
  endDate: string;
  gpa: string;
  achievements: string;
  city: string;
}
