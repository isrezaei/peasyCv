import type { RemovableSectionType, ResumeData, SectionMeta } from "@/types";

/** Sections that live in the secondary/side column of multi-column templates. */
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

export function splitColumns(sections: SectionMeta[]): ColumnSplit {
  return {
    main: sections.filter((section) => !SIDE_SECTION_TYPES.has(section.type)),
    side: sections.filter((section) => SIDE_SECTION_TYPES.has(section.type)),
  };
}
