import type { ComponentType } from "react";
import type { ResumeData } from "./resume";
import type { ThemeSettings } from "./theme";

export type TemplateId =
  | "professional-single-column"
  | "double-column"
  | "sidebar-column"
  // Imported "Persian Resume Templates" designs.
  | "aside-dark"
  | "aside-photo"
  | "timeline-panel"
  | "header-band"
  | "compact-duo"
  | "ruled-single"
  | "classic-centered";

export interface TemplateProps {
  resume: ResumeData;
  theme: ThemeSettings;
}

export interface TemplateDefinition {
  id: TemplateId;
  label: string;
  /** Optional named skin presented in the picker; renders one of the core layouts. */
  component: ComponentType<TemplateProps>;
}
