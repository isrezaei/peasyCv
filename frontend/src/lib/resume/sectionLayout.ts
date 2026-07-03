import type { RemovableSectionType, ResumeData, SectionMeta } from "@/types";

/** Default sections that live in the secondary/side column of multi-column templates. */
const SIDE_SECTION_TYPES: ReadonlySet<RemovableSectionType> = new Set([
  "projects",
  "languages",
  "certifications",
]);

export function getVisibleSections(resume: ResumeData): SectionMeta[] {
  return resume.sections
    .filter((section) => section.visible)
    .slice()
    .sort((a, b) => a.order - b.order);
}

export interface ColumnSplit {
  main: SectionMeta[];
  side: SectionMeta[];
}

/**
 * Splits visible sections into a main and a side column. The default side set
 * (projects / languages / certifications) matches the original two-column
 * templates; the imported templates pass their own side set (e.g. a dark aside
 * that also holds skills, or a panel that holds the summary) so each layout can
 * place sections faithfully while still ordering them by the user's section
 * order within each column.
 */
export function splitColumns(
  sections: SectionMeta[],
  sideTypes: ReadonlySet<RemovableSectionType> = SIDE_SECTION_TYPES,
): ColumnSplit {
  return {
    main: sections.filter((section) => !sideTypes.has(section.type)),
    side: sections.filter((section) => sideTypes.has(section.type)),
  };
}
