import { useEffect, useMemo } from "react";
import {
  composeResumeLayout,
  experienceGrowthCrossesPage,
  registerExperienceBoundaryProbe,
  singleColumnFlowPlans,
} from "@/lib/pagination";
import type { ResumeData } from "@/types";

export function useResumeLayout(resume: ResumeData) {
  // While a single-column template is mounted, page-bottom boundary questions
  // (asked by the add-bullet store action, never by rendering) are answered by
  // this engine's own flow plan. Registration only stores a pure function — it
  // cannot create or change data.
  useEffect(
    () =>
      registerExperienceBoundaryProbe((current, experienceId) =>
        experienceGrowthCrossesPage(singleColumnFlowPlans, current, experienceId),
      ),
    [],
  );

  return useMemo(() => composeResumeLayout(resume), [resume]);
}
