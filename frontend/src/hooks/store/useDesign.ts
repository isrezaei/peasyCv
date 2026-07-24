import { useShallow } from "zustand/react/shallow";
import { useResumeStore } from "@/store/useResumeStore";

export function useDesign() {
  return useResumeStore(
    useShallow((state) => ({
      theme: state.resume.theme,
      setFontFamily: state.setFontFamily,
      setFontScale: state.setFontScale,
      setLineHeight: state.setLineHeight,
      setPageMargin: state.setPageMargin,
      setSectionSpacing: state.setSectionSpacing,
      setPageBackground: state.setPageBackground,
      setBackgroundIntensity: state.setBackgroundIntensity,
      setColumnIntensity: state.setColumnIntensity,
      setColumnWidth: state.setColumnWidth,
      setShowSectionIcons: state.setShowSectionIcons,
      setShowSectionSeparators: state.setShowSectionSeparators,
      setAtsMode: state.setAtsMode,
      templateId: state.resume.templateId,
    })),
  );
}
