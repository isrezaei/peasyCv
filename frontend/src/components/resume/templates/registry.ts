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

/**
 * Templates OFFERED in the picker, in display order. Five imported skins
 * (aside-dark, aside-photo, compact-duo, ruled-single, classic-centered) are
 * intentionally omitted here so they are no longer selectable — but they stay in
 * {@link templateRegistry} (and in the TemplateId union / backend allowlist), so a
 * résumé already saved on one still loads and renders unchanged. Removal is
 * display-list only, mirroring how vivid palettes were pulled from the swatch grid.
 */
export const templateOrder: TemplateId[] = [
  "professional-single-column",
  "double-column",
  "sidebar-column",
  "timeline-panel",
  "header-band",
];

/**
 * Templates whose coloured side column honours the theme's "Column Layout"
 * width preset (they mark their layout `sideWidthAdjustable`). The design panel
 * shows the width picker only while one of these is selected.
 */
export const COLUMN_WIDTH_TEMPLATE_IDS: ReadonlySet<TemplateId> = new Set([
  "sidebar-column",
  "timeline-panel",
]);

/**
 * Templates that paint a decorative pattern INSIDE their side column (the
 * geometric COLUMN_* datasets) rather than as a full-page A4 background. The
 * pattern picker previews and names the column variant for these.
 */
export const COLUMN_PATTERN_TEMPLATE_IDS: ReadonlySet<TemplateId> = new Set([
  "timeline-panel",
]);

export function getTemplate(templateId: TemplateId): TemplateDefinition {
  return templateRegistry[templateId];
}
