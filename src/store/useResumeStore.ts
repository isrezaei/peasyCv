import { create } from "zustand";
import { debounce, resumeRepository } from "@/lib/persistence";
import { normalizeResume } from "@/lib/resume/normalizeResume";
import { createResumeSlice } from "./slices/createResumeSlice";
import { createSectionsSlice } from "./slices/createSectionsSlice";
import { createThemeSlice } from "./slices/createThemeSlice";
import { createUiSlice } from "./slices/createUiSlice";
import type { RootStore, SaveStatus } from "./types";

export const useResumeStore = create<RootStore>()((...sliceArgs) => ({
  ...createResumeSlice(...sliceArgs),
  ...createSectionsSlice(...sliceArgs),
  ...createThemeSlice(...sliceArgs),
  ...createUiSlice(...sliceArgs),
}));

const AUTOSAVE_DELAY_MS = 600;

/* ----------------------------------------------------------------------------
 * Save-status coordinator
 *
 * The top-bar indicator must read «در حال ذخیره» the instant there is unsaved
 * work and «ذخیره شد» only once everything has settled. Two independent things
 * count as unsaved work: (a) fields with a deferred (debounced) edit not yet
 * committed to the store — see useDeferredCommit — and (b) a persist write that
 * has been scheduled or is in flight. We track both and derive the status from
 * them, so the indicator follows the real lifecycle, not a fake timer.
 * ------------------------------------------------------------------------- */

let pendingFieldEdits = 0;
let persistPending = false;

function refreshSaveStatus(): void {
  const status: SaveStatus = pendingFieldEdits > 0 || persistPending ? "saving" : "saved";
  const store = useResumeStore.getState();
  if (store.saveStatus !== status) store.setSaveStatus(status);
}

/** Called by useDeferredCommit when a field gains an uncommitted local edit. */
export function beginFieldEdit(): void {
  pendingFieldEdits += 1;
  refreshSaveStatus();
}

/** Called by useDeferredCommit once a field's deferred edit is committed/flushed. */
export function endFieldEdit(): void {
  if (pendingFieldEdits > 0) pendingFieldEdits -= 1;
  refreshSaveStatus();
}

/* Field flush registry — lets us commit every field's pending edit synchronously
 * before the tab is hidden/closed, so a value typed within the debounce window is
 * never lost on a hard reload or navigation. */
const fieldFlushers = new Set<() => void>();

export function registerFieldFlush(flush: () => void): () => void {
  fieldFlushers.add(flush);
  return () => {
    fieldFlushers.delete(flush);
  };
}

function flushAllFields(): void {
  // Snapshot first: a flush commits to the store and may unmount/unregister.
  for (const flush of [...fieldFlushers]) flush();
}

const persistResume = debounce((resume: RootStore["resume"]) => {
  void resumeRepository.save(resume).finally(() => {
    persistPending = false;
    refreshSaveStatus();
  });
}, AUTOSAVE_DELAY_MS);

export async function hydrateResumeStore(): Promise<void> {
  // In the headless PDF render the resume is injected on the window and the
  // /print route hydrates the store directly; never overwrite it from (empty)
  // localStorage here.
  if (typeof window !== "undefined" && window.__RESUME_DATA__) {
    return;
  }

  const stored = await resumeRepository.get();
  if (stored) {
    useResumeStore.getState().setResume(normalizeResume(stored));
  }
  useResumeStore.getState().setHydrated(true);
  // A freshly loaded document is, by definition, in sync with storage.
  refreshSaveStatus();
}

let stopAutosave: (() => void) | null = null;

export function startAutosave(): () => void {
  if (stopAutosave) return stopAutosave;

  const unsubscribe = useResumeStore.subscribe((state, previousState) => {
    if (state.resume !== previousState.resume) {
      // A commit reached the store, so a persist is now owed: mark it pending up
      // front (keeps the indicator «در حال ذخیره» through the debounce window),
      // then schedule the actual write.
      persistPending = true;
      refreshSaveStatus();
      persistResume(state.resume);
    }
  });

  // Flush deferred field edits and any owed persist before the tab goes away, so
  // nothing typed within a debounce window is lost on reload/close.
  const flushBeforeUnload = () => {
    flushAllFields();
    persistResume.flush();
  };
  const handleVisibility = () => {
    if (document.visibilityState === "hidden") flushBeforeUnload();
  };
  window.addEventListener("pagehide", flushBeforeUnload);
  document.addEventListener("visibilitychange", handleVisibility);

  stopAutosave = () => {
    unsubscribe();
    window.removeEventListener("pagehide", flushBeforeUnload);
    document.removeEventListener("visibilitychange", handleVisibility);
    stopAutosave = null;
  };

  return stopAutosave;
}
