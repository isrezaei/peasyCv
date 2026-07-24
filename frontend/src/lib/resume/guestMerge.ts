import type { ResumeData } from "@/types";
import { ApiError } from "@/lib/api/client";
import { upsertResume } from "@/lib/api/resumes";
import { clearGuestResume, loadGuestResume } from "@/lib/persistence";
import { createId } from "@/lib/utils/id";
import { normalizeResume } from "./normalizeResume";

/**
 * Attach the guest-built resume to the just-authenticated account as a NEW
 * resume. Nothing is overwritten and nothing is lost: the document keeps its
 * own id/title and lands next to the user's existing resumes via the upsert
 * (PUT /resumes/:id creates unknown ids).
 *
 * Guards:
 *  - Untouched visitor: the guest key is only written by an actual edit, so a
 *    missing key means there is nothing to merge (no junk resume is created).
 *  - Shape: normalizeResume runs BEFORE the first authenticated save — the API
 *    DTO validates strictly and 400s on any drifted/legacy localStorage shape.
 *  - Double merge: the key is deleted after a successful save, so a re-login on
 *    this browser finds nothing to merge. (Even a stale key only re-PUTs the
 *    same id — replacing that one resume, never duplicating it.)
 *  - Id collision: if the id somehow belongs to another user the upsert 403s;
 *    retry once under a fresh id.
 *
 * Returns the saved resume, or null when there was nothing to merge.
 */
let inFlight: Promise<ResumeData | null> | null = null;

export function mergeGuestResume(): Promise<ResumeData | null> {
  // Concurrent callers share one run (React dev StrictMode mounts the AuthGate
  // effect twice): a second PUT of the same id would race the first into a
  // unique-constraint 409 and hydrate without a merged id.
  inFlight ??= doMerge().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function doMerge(): Promise<ResumeData | null> {
  const raw = await loadGuestResume();
  if (!raw) return null;

  const resume = normalizeResume(raw);
  try {
    const saved = await upsertResume(resume);
    await clearGuestResume();
    return saved;
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      const saved = await upsertResume({ ...resume, id: createId() });
      await clearGuestResume();
      return saved;
    }
    throw error;
  }
}
