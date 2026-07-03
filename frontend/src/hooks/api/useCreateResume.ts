"use client";

import useSWR from "swr";
import { RESUME_SWR_KEY } from "@/lib/api/resumeKey";
import { resumeRepository } from "@/lib/persistence";
import { createDefaultResume } from "@/lib/resume/createDefaultResume";
import type { ResumeData } from "@/types";

export function useCreateResume() {
  const { mutate } = useSWR(RESUME_SWR_KEY, () => resumeRepository.get());

  return async function createResume(): Promise<ResumeData> {
    const resume = createDefaultResume();
    await mutate(resumeRepository.save(resume), {
      optimisticData: resume,
      rollbackOnError: true,
      populateCache: true,
      revalidate: false,
    });
    return resume;
  };
}
