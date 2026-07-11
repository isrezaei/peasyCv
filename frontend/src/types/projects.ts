import type { ID } from "./common";

export interface ProjectItem {
  id: ID;
  name: string;
  role: string;
  link: string;
  /** Whether the project's external link is rendered. Off hides the link (and its
   *  icon) even when `link` holds a value, so a section option can suppress it. */
  linkVisible: boolean;
  description: string;
}
