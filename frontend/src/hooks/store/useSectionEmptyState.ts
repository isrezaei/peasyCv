import { useShallow } from "zustand/react/shallow";
import { useResumeStore } from "@/store/useResumeStore";
import { richTextToPlainText } from "@/lib/richtext/sanitize";
import type { RemovableSectionType } from "@/types";

export function useSectionEmptyState(type: RemovableSectionType) {
  return useResumeStore(
    useShallow((state) => {
      switch (type) {
        case "experience":
          return { isEmpty: state.resume.experience.length === 0, addEntry: state.addExperience };
        case "skills":
          return { isEmpty: state.resume.skills.length === 0, addEntry: state.addSkillGroup };
        case "education":
          return { isEmpty: state.resume.education.length === 0, addEntry: state.addEducation };
        case "projects":
          return { isEmpty: state.resume.projects.length === 0, addEntry: state.addProject };
        case "languages":
          return { isEmpty: state.resume.languages.length === 0, addEntry: state.addLanguage };
        case "certifications":
          return {
            isEmpty: state.resume.certifications.length === 0,
            addEntry: state.addCertification,
          };
        case "achievements":
          return {
            isEmpty: state.resume.achievements.length === 0,
            addEntry: state.addAchievement,
          };
        case "summary":
          return {
            isEmpty: richTextToPlainText(state.resume.summary.html).length === 0,
            addEntry: null,
          };
      }
    }),
  );
}
