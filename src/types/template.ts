import type { ComponentType } from "react";
import type { ResumeData } from "./resume";
import type { ThemeSettings } from "./theme";

export type TemplateId = "professional-single-column" | "double-column" | "sidebar-column";

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
