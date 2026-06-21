import { t } from "@/lib/i18n";
import type { TemplateDefinition, TemplateId } from "@/types";
import { DoubleColumnTemplate } from "./double-column/DoubleColumnTemplate";
import { ProfessionalTemplate } from "./professional/ProfessionalTemplate";
import { SidebarColumnTemplate } from "./sidebar-column/SidebarColumnTemplate";

export const templateRegistry: Record<TemplateId, TemplateDefinition> = {
  "professional-single-column": {
    id: "professional-single-column",
    label: t.templatesPanel.names["professional-single-column"],
    component: ProfessionalTemplate,
  },
  "double-column": {
    id: "double-column",
    label: t.templatesPanel.names["double-column"],
    component: DoubleColumnTemplate,
  },
  "sidebar-column": {
    id: "sidebar-column",
    label: t.templatesPanel.names["sidebar-column"],
    component: SidebarColumnTemplate,
  },
};

export const templateOrder: TemplateId[] = [
  "professional-single-column",
  "double-column",
  "sidebar-column",
];

export function getTemplate(templateId: TemplateId): TemplateDefinition {
  return templateRegistry[templateId];
}
