import { useShallow } from "zustand/react/shallow";
import { useResumeStore } from "@/store/useResumeStore";

/** Actions-only selector (data arrives via props), so editing one group never re-renders others. */
export function useSkills() {
  return useResumeStore(
    useShallow((state) => ({
      addSkillGroup: state.addSkillGroup,
      updateSkillGroup: state.updateSkillGroup,
      removeSkillGroup: state.removeSkillGroup,
      addSkill: state.addSkill,
      updateSkill: state.updateSkill,
      removeSkill: state.removeSkill,
    })),
  );
}
