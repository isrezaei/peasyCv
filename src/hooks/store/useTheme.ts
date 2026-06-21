import { useShallow } from "zustand/react/shallow";
import { useResumeStore } from "@/store/useResumeStore";

export function useTheme() {
  return useResumeStore(
    useShallow((state) => ({
      theme: state.resume.theme,
      setThemeId: state.setThemeId,
      setCustomColor: state.setCustomColor,
      setPageBackground: state.setPageBackground,
      setBackgroundPattern: state.setBackgroundPattern,
    })),
  );
}
