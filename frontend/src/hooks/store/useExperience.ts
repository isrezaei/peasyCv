import { useShallow } from "zustand/react/shallow";
import { useResumeStore } from "@/store/useResumeStore";

/**
 * Actions-only selector. Returns nothing but stable store action references, so a
 * component using it never re-renders when experience data changes — the entry
 * data itself flows in through props from the resume document. This is what keeps
 * editing one experience entry from re-rendering its siblings or other sections.
 */
export function useExperience() {
  return useResumeStore(
    useShallow((state) => ({
      addExperience: state.addExperience,
      updateExperience: state.updateExperience,
      removeExperience: state.removeExperience,
      addResponsibility: state.addResponsibility,
      addResponsibilityAfter: state.addResponsibilityAfter,
      updateResponsibility: state.updateResponsibility,
      removeResponsibility: state.removeResponsibility,
    })),
  );
}
