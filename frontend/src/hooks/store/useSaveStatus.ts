import { useShallow } from "zustand/react/shallow";
import { useResumeStore } from "@/store/useResumeStore";

export function useSaveStatus() {
  return useResumeStore(
    useShallow((state) => ({
      isHydrated: state.isHydrated,
      saveStatus: state.saveStatus,
    })),
  );
}
