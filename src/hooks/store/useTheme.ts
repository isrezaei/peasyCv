import { useShallow } from "zustand/react/shallow";
import { useResumeStore } from "@/store/useResumeStore";

export function useTheme() {
  return useResumeStore(
    useShallow((state) => ({
      theme: state.resume.theme,
      setThemeId: state.setThemeId,
      setPageBackground: state.setPageBackground,
      setBackgroundPattern: state.setBackgroundPattern,
    })),
  );
}
