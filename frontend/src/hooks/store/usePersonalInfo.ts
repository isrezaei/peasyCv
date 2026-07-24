import { useShallow } from "zustand/react/shallow";
import { useResumeStore } from "@/store/useResumeStore";

export function usePersonalInfo() {
  return useResumeStore(
    useShallow((state) => ({
      personalInfo: state.resume.personalInfo,
      updatePersonalInfo: state.updatePersonalInfo,
      setProfileImage: state.setProfileImage,
      removeProfileImage: state.removeProfileImage,
      setPhotoStyle: state.setPhotoStyle,
      setImageSide: state.setImageSide,
      toggleField: state.toggleField,
      setUppercaseName: state.setUppercaseName,
      addLink: state.addLink,
      updateLink: state.updateLink,
      removeLink: state.removeLink,
    })),
  );
}
