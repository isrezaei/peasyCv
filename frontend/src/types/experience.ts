import type { ID } from "./common";

export interface EmploymentPeriod {
  start: string;
  end: string;
  current: boolean;
}

export interface ResponsibilityItem {
  id: ID;
  text: string;
}

export interface ExperienceItem {
  id: ID;
  jobTitle: string;
  companyName: string;
  period: EmploymentPeriod;
  city: string;
  projectLink: string;
  projectDescription: string;
  responsibilities: ResponsibilityItem[];
}
