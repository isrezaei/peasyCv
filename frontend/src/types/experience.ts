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
  /** External project link, mirroring `ProjectItem.link` ('' or a valid http(s) URL). */
  link: string;
  /** Whether the entry's external link is rendered. Off hides the link (and its
   *  icon) even when `link` holds a value, so a section option can suppress it. */
  linkVisible: boolean;
  responsibilities: ResponsibilityItem[];
}
