"use client";

import useSWR from "swr";
import { RESUME_SWR_KEY } from "@/lib/api/resumeKey";
import { resumeRepository } from "@/lib/persistence";

export function useDeleteResume() {
  const { mutate } = useSWR(RESUME_SWR_KEY, () => resumeRepository.get());

  return async function deleteResume(): Promise<void> {
    await mutate(resumeRepository.remove().then(() => null), {
      optimisticData: null,
      rollbackOnError: true,
      populateCache: true,
      revalidate: false,
    });
  };
}
