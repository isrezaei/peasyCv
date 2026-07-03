import type { ResumeData } from "@/types";
import { deleteResume, getCurrentResume, upsertResume } from "@/lib/api/resumes";

/**
 * Single point of contact for resume persistence. Backed by the NestJS API:
 *   get()    -> GET  /resumes/current   (the user's latest resume, or null)
 *   save()   -> PUT  /resumes/:id       (create-or-replace the whole ResumeData)
 *   remove() -> DELETE /resumes/:id
 *
 * The store's autosave + SWR hooks call through this interface unchanged, so
 * switching from local storage to the API required no changes above this file.
 * The single-document store maps onto the multi-resume API via the "current"
 * resume; remove() targets the last resume seen by get()/save().
 */
let lastResumeId: string | null = null;

export const resumeRepository = {
  async get(): Promise<ResumeData | null> {
    const resume = await getCurrentResume();
    if (resume) lastResumeId = resume.id;
    return resume;
  },
  async save(resume: ResumeData): Promise<ResumeData> {
    const saved = await upsertResume(resume);
    lastResumeId = saved.id;
    return saved;
  },
  async remove(): Promise<void> {
    if (lastResumeId) {
      await deleteResume(lastResumeId);
      lastResumeId = null;
    }
  },
};
