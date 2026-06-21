import { useShallow } from "zustand/react/shallow";
import { useResumeStore } from "@/store/useResumeStore";

export function useActivePanel() {
  return useResumeStore(
    useShallow((state) => ({
      activePanel: state.activePanel,
      setActivePanel: state.setActivePanel,
    })),
  );
}
