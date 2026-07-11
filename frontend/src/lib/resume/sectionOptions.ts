import { t } from "@/lib/i18n";
import type {
  CertificationItem,
  EducationItem,
  ExperienceItem,
  ID,
  LanguageItem,
  ProjectItem,
  RemovableSectionType,
  SkillGroup,
} from "@/types";

/**
 * The narrow slice of store actions section options may write through. The
 * store satisfies it structurally; defining it here instead of importing
 * `RootStore` keeps the dependency direction intact (`lib/` is the domain
 * layer — the store consumes it, not the reverse). A future option widens this
 * by exactly one method.
 */
export interface SectionOptionActions {
  updateProject: (id: ID, patch: Partial<Omit<ProjectItem, "id">>) => void;
  updateExperience: (
    id: ID,
    patch: Partial<Omit<ExperienceItem, "id" | "responsibilities">>,
  ) => void;
}

/**
 * The item rendered per entry of each removable section — an option registered
 * under a key receives exactly that section's item. `summary` has no per-item
 * entries, so it maps to `never` (its options list can only ever be empty).
 */
export interface SectionItemMap {
  summary: never;
  experience: ExperienceItem;
  skills: SkillGroup;
  education: EducationItem;
  projects: ProjectItem;
  languages: LanguageItem;
  certifications: CertificationItem;
}

export interface SectionOption<Item> {
  /** Stable identity (React key). */
  id: string;
  /** Display label — always an `lib/i18n/fa.ts` string, never hardcoded. */
  label: string;
  /** The single item's current state → checkbox state. */
  read: (item: Item) => boolean;
  /** Applies the toggled value to THIS item through the store's actions. */
  write: (actions: SectionOptionActions, item: Item, checked: boolean) => void;
  /** Whether the option is currently actionable for this item; omitted means
   *  always. Unused today — kept for a future item-scoped option. */
  enabled?: (item: Item) => boolean;
}

const showProjectLink: SectionOption<ProjectItem> = {
  id: "projects-show-link",
  label: t.projects.showLink,
  read: (item) => item.linkVisible,
  write: (actions, item, checked) => actions.updateProject(item.id, { linkVisible: checked }),
};

// Faithful mirror of showProjectLink for the Experience entry's link pair.
const showExperienceLink: SectionOption<ExperienceItem> = {
  id: "experience-show-link",
  label: t.experience.showLink,
  read: (item) => item.linkVisible,
  write: (actions, item, checked) => actions.updateExperience(item.id, { linkVisible: checked }),
};

/**
 * Section type → the options its per-item gear popover offers. Exhaustive over
 * `RemovableSectionType` on purpose (no `Partial`, no index signature): adding
 * a new section type without deciding its options must fail `tsc`. Adding a
 * future option costs one entry here plus that field's own vertical change —
 * the popover (`SectionOptionsGear`) only iterates this array and knows no
 * option by name.
 */
export const SECTION_OPTIONS: {
  readonly [K in RemovableSectionType]: readonly SectionOption<SectionItemMap[K]>[];
} = {
  summary: [],
  experience: [showExperienceLink],
  skills: [],
  education: [],
  projects: [showProjectLink],
  // Languages display settings are SECTION-WIDE and live in the section's main
  // menu (SectionCompactMenu), not the per-item gear.
  languages: [],
  certifications: [],
};
