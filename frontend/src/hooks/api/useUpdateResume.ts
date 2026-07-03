"use client";

import useSWR from "swr";
import { RESUME_SWR_KEY } from "@/lib/api/resumeKey";
import { resumeRepository } from "@/lib/persistence";
import type { ResumeData } from "@/types";

export function useUpdateResume() {
  const { mutate } = useSWR(RESUME_SWR_KEY, () => resumeRepository.get());

  return async function updateResume(resume: ResumeData): Promise<ResumeData> {
    await mutate(resumeRepository.save(resume), {
      optimisticData: resume,
      rollbackOnError: true,
      populateCache: true,
      revalidate: false,
    });
    return resume;
  };
}
