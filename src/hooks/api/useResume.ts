"use client";

import useSWR from "swr";
import { RESUME_SWR_KEY } from "@/lib/api/resumeKey";
import { resumeRepository } from "@/lib/persistence";

export function useResume() {
  return useSWR(RESUME_SWR_KEY, () => resumeRepository.get(), {
    revalidateOnFocus: false,
  });
}
