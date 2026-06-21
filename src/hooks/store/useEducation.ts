import { useShallow } from "zustand/react/shallow";
import { useResumeStore } from "@/store/useResumeStore";

/** Actions-only selector (data arrives via props), so editing one entry never re-renders others. */
export function useEducation() {
  return useResumeStore(
    useShallow((state) => ({
      addEducation: state.addEducation,
      updateEducation: state.updateEducation,
      removeEducation: state.removeEducation,
    })),
  );
}
