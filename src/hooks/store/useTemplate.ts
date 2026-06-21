import { useShallow } from "zustand/react/shallow";
import { useResumeStore } from "@/store/useResumeStore";

export function useTemplate() {
  return useResumeStore(
    useShallow((state) => ({
      templateId: state.resume.templateId,
      setTemplate: state.setTemplate,
    })),
  );
}
