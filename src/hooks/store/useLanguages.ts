import { useShallow } from "zustand/react/shallow";
import { useResumeStore } from "@/store/useResumeStore";

/** Actions-only selector (data arrives via props), so editing one entry never re-renders others. */
export function useLanguages() {
  return useResumeStore(
    useShallow((state) => ({
      addLanguage: state.addLanguage,
      updateLanguage: state.updateLanguage,
      setLanguageLevel: state.setLanguageLevel,
      removeLanguage: state.removeLanguage,
    })),
  );
}
