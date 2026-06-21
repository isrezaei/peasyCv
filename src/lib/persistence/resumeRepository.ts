import { LocalStorageAdapter } from "./LocalStorageAdapter";
import type { ResumeData } from "@/types";

const RESUME_STORAGE_KEY = "ai-res:resume";

const adapter = new LocalStorageAdapter<ResumeData>();

/**
 * Single point of contact for resume persistence. Swapping LocalStorageAdapter
 * for an HTTP-backed adapter here is the only change needed to move to a real API.
 */
export const resumeRepository = {
  async get(): Promise<ResumeData | null> {
    return adapter.load(RESUME_STORAGE_KEY);
  },
  async save(resume: ResumeData): Promise<ResumeData> {
    await adapter.save(RESUME_STORAGE_KEY, resume);
    return resume;
  },
  async remove(): Promise<void> {
    await adapter.remove(RESUME_STORAGE_KEY);
  },
};
