import { useShallow } from "zustand/react/shallow";
import { useResumeStore } from "@/store/useResumeStore";

export function useSummary() {
  return useResumeStore(
    useShallow((state) => ({
      html: state.resume.summary.html,
      updateSummary: state.updateSummary,
    })),
  );
}
