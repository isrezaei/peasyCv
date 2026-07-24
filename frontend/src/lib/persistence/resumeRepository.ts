import type { ResumeData } from "@/types";
import { deleteResume, getCurrentResume, getResume, upsertResume } from "@/lib/api/resumes";
import { hasSession } from "@/lib/api/tokens";
import { LocalStorageAdapter } from "./LocalStorageAdapter";

/**
 * Single point of contact for resume persistence — auth-aware:
 *
 *  - GUEST (no session): the whole document lives in localStorage under
 *    {@link GUEST_RESUME_KEY}. The app is fully usable without an account; only
 *    the PDF download asks for a login. The key is only ever written by an
 *    actual edit (autosave subscribes after hydration), so an untouched visit
 *    never creates one — and on login the document is merged into the account
 *    as a NEW resume (see lib/resume/guestMerge).
 *
 *  - AUTHENTICATED: backed by the NestJS API, id-addressed:
 *      get(id?)  -> GET /resumes/:id, or GET /resumes/current (latest) without an id
 *      save()    -> PUT /resumes/:id  (create-or-replace the whole ResumeData)
 *      remove()  -> DELETE /resumes/:id (the last resume seen by get()/save())
 *
 * The store's autosave + SWR hooks call through this interface unchanged.
 */
export const GUEST_RESUME_KEY = "ai-res:resume";

const guestStore = new LocalStorageAdapter<ResumeData>();

let lastResumeId: string | null = null;

export const resumeRepository = {
  async get(id?: string): Promise<ResumeData | null> {
    if (!hasSession()) return guestStore.load(GUEST_RESUME_KEY);
    const resume = id ? await getResume(id) : await getCurrentResume();
    if (resume) lastResumeId = resume.id;
    return resume;
  },

  async save(resume: ResumeData): Promise<ResumeData> {
    if (!hasSession()) {
      await guestStore.save(GUEST_RESUME_KEY, resume);
      return resume;
    }
    const saved = await upsertResume(resume);
    lastResumeId = saved.id;
    return saved;
  },

  async remove(): Promise<void> {
    if (!hasSession()) {
      await guestStore.remove(GUEST_RESUME_KEY);
      return;
    }
    if (lastResumeId) {
      await deleteResume(lastResumeId);
      lastResumeId = null;
    }
  },
};

/** The locally-persisted guest resume, or null when the visitor never edited. */
export function loadGuestResume(): Promise<ResumeData | null> {
  return guestStore.load(GUEST_RESUME_KEY);
}

/** Forget the guest resume — runs after a successful merge (double-merge guard). */
export function clearGuestResume(): Promise<void> {
  return guestStore.remove(GUEST_RESUME_KEY);
}
