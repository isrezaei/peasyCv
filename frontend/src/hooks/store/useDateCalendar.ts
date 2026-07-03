import { useShallow } from "zustand/react/shallow";
import { useResumeStore } from "@/store/useResumeStore";

/** Reads the active calendar system (presentation) and its setter. */
export function useDateCalendar() {
  return useResumeStore(
    useShallow((state) => ({
      calendar: state.resume.theme.dateCalendar,
      setDateCalendar: state.setDateCalendar,
    })),
  );
}
