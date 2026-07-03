import { useShallow } from "zustand/react/shallow";
import { useResumeStore } from "@/store/useResumeStore";

export function useSidebar() {
  return useResumeStore(
    useShallow((state) => ({
      collapsed: state.sidebarCollapsed,
      setCollapsed: state.setSidebarCollapsed,
    })),
  );
}
