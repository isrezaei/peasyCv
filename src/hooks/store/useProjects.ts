import { useShallow } from "zustand/react/shallow";
import { useResumeStore } from "@/store/useResumeStore";

/** Actions-only selector (data arrives via props), so editing one entry never re-renders others. */
export function useProjects() {
  return useResumeStore(
    useShallow((state) => ({
      addProject: state.addProject,
      updateProject: state.updateProject,
      removeProject: state.removeProject,
    })),
  );
}
