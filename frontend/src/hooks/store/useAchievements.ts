import { useShallow } from "zustand/react/shallow";
import { useResumeStore } from "@/store/useResumeStore";

/** Actions-only selector (data arrives via props), so editing one entry never re-renders others. */
export function useAchievements() {
  return useResumeStore(
    useShallow((state) => ({
      addAchievement: state.addAchievement,
      updateAchievement: state.updateAchievement,
      removeAchievement: state.removeAchievement,
    })),
  );
}
