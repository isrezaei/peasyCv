import type { SectionsSlice, SliceCreator } from "../types";

const touch = () => new Date().toISOString();

export const createSectionsSlice: SliceCreator<SectionsSlice> = (set) => ({
  reorderSections: (orderedIds) =>
    set((state) => {
      const sectionById = new Map(state.resume.sections.map((section) => [section.id, section]));
      const reordered = orderedIds
        .map((id, index) => {
          const section = sectionById.get(id);
          return section ? { ...section, order: index } : null;
        })
        .filter((section): section is NonNullable<typeof section> => section !== null);

      return {
        resume: { ...state.resume, sections: reordered, updatedAt: touch() },
      };
    }),

  toggleSectionVisibility: (id) =>
    set((state) => ({
      resume: {
        ...state.resume,
        sections: state.resume.sections.map((section) =>
          section.id === id ? { ...section, visible: !section.visible } : section,
        ),
        updatedAt: touch(),
      },
    })),

  setSectionDirection: (id, direction) =>
    set((state) => ({
      resume: {
        ...state.resume,
        sections: state.resume.sections.map((section) =>
          section.id === id ? { ...section, direction } : section,
        ),
        updatedAt: touch(),
      },
    })),
});
