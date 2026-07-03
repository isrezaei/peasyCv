import { useResumeStore } from "@/store/useResumeStore";

export function useResumeDocument() {
  return useResumeStore((state) => state.resume);
}
