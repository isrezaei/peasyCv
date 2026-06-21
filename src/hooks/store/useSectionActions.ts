import { useShallow } from "zustand/react/shallow";
import { useResumeStore } from "@/store/useResumeStore";

/**
 * Actions-only selector for section mutations. Section metadata is passed to the
 * title block via props, so subscribing to just the (stable) actions keeps a
 * heading from re-rendering on unrelated content edits.
 */
export function useSectionActions() {
  return useResumeStore(
    useShallow((state) => ({
      toggleSectionVisibility: state.toggleSectionVisibility,
      setSectionDirection: state.setSectionDirection,
    })),
  );
}
