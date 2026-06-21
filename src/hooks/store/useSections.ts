import { useShallow } from "zustand/react/shallow";
import { useResumeStore } from "@/store/useResumeStore";

export function useSections() {
  return useResumeStore(
    useShallow((state) => ({
      sections: state.resume.sections,
      reorderSections: state.reorderSections,
      toggleSectionVisibility: state.toggleSectionVisibility,
      setSectionDirection: state.setSectionDirection,
    })),
  );
}
