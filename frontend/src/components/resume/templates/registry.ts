import { t } from "@/lib/i18n";
import type { TemplateDefinition, TemplateId } from "@/types";
import { AsideDarkTemplate } from "./aside-dark/AsideDarkTemplate";
import { AsidePhotoTemplate } from "./aside-photo/AsidePhotoTemplate";
import { ClassicCenteredTemplate } from "./classic-centered/ClassicCenteredTemplate";
import { CompactDuoTemplate } from "./compact-duo/CompactDuoTemplate";
import { DoubleColumnTemplate } from "./double-column/DoubleColumnTemplate";
import { HeaderBandTemplate } from "./header-band/HeaderBandTemplate";
import { ProfessionalTemplate } from "./professional/ProfessionalTemplate";
import { RuledSingleTemplate } from "./ruled-single/RuledSingleTemplate";
import { SidebarColumnTemplate } from "./sidebar-column/SidebarColumnTemplate";
import { TimelinePanelTemplate } from "./timeline-panel/TimelinePanelTemplate";

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
  "aside-dark": {
    id: "aside-dark",
    label: t.templatesPanel.names["aside-dark"],
    component: AsideDarkTemplate,
  },
  "aside-photo": {
    id: "aside-photo",
    label: t.templatesPanel.names["aside-photo"],
    component: AsidePhotoTemplate,
  },
  "timeline-panel": {
    id: "timeline-panel",
    label: t.templatesPanel.names["timeline-panel"],
    component: TimelinePanelTemplate,
  },
  "header-band": {
    id: "header-band",
    label: t.templatesPanel.names["header-band"],
    component: HeaderBandTemplate,
  },
  "compact-duo": {
    id: "compact-duo",
    label: t.templatesPanel.names["compact-duo"],
    component: CompactDuoTemplate,
  },
  "ruled-single": {
    id: "ruled-single",
    label: t.templatesPanel.names["ruled-single"],
    component: RuledSingleTemplate,
  },
  "classic-centered": {
    id: "classic-centered",
    label: t.templatesPanel.names["classic-centered"],
    component: ClassicCenteredTemplate,
  },
};

export const templateOrder: TemplateId[] = [
  "professional-single-column",
  "double-column",
  "sidebar-column",
  "aside-dark",
  "aside-photo",
  "timeline-panel",
  "header-band",
  "compact-duo",
  "ruled-single",
  "classic-centered",
];

export function getTemplate(templateId: TemplateId): TemplateDefinition {
  return templateRegistry[templateId];
}
