import { isDesktopViewport } from "@/lib/responsive";
import type { SliceCreator, UiSlice } from "../types";

export const createUiSlice: SliceCreator<UiSlice> = (set) => ({
  isHydrated: false,
  saveStatus: "idle",
  activePanel: "design",
  // Closed by default in responsive/mobile mode (below Chakra `xl`); open by
  // default on desktop, unchanged. Evaluated once at store creation on the
  // client (the editor tree is client-only), so the overlay drawer never
  // flashes open on a phone before an effect could close it.
  sidebarCollapsed: !isDesktopViewport(),
  emptyHighlightActive: false,
  emptyHighlightNonce: 0,
  setHydrated: (hydrated) => set({ isHydrated: hydrated }),
  setSaveStatus: (status) => set({ saveStatus: status }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  // Bump the nonce on every attempt (even when already active) so per-attempt
  // chrome re-fires on consecutive blocked clicks; see UiSlice.emptyHighlightNonce.
  activateEmptyHighlights: () =>
    set((state) => ({
      emptyHighlightActive: true,
      emptyHighlightNonce: state.emptyHighlightNonce + 1,
    })),
  clearEmptyHighlights: () => set({ emptyHighlightActive: false }),
});
