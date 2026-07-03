import type { SliceCreator, UiSlice } from "../types";

export const createUiSlice: SliceCreator<UiSlice> = (set) => ({
  isHydrated: false,
  saveStatus: "idle",
  activePanel: "design",
  sidebarCollapsed: false,
  setHydrated: (hydrated) => set({ isHydrated: hydrated }),
  setSaveStatus: (status) => set({ saveStatus: status }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
});
