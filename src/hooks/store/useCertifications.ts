import { useShallow } from "zustand/react/shallow";
import { useResumeStore } from "@/store/useResumeStore";

/** Actions-only selector (data arrives via props), so editing one entry never re-renders others. */
export function useCertifications() {
  return useResumeStore(
    useShallow((state) => ({
      addCertification: state.addCertification,
      updateCertification: state.updateCertification,
      removeCertification: state.removeCertification,
    })),
  );
}
