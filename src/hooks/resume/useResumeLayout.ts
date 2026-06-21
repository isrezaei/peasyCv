import { useMemo } from "react";
import { composeResumeLayout } from "@/lib/pagination";
import type { ResumeData } from "@/types";

export function useResumeLayout(resume: ResumeData) {
  return useMemo(() => composeResumeLayout(resume), [resume]);
}
