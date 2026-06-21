import { create } from "zustand";
import { debounce, resumeRepository } from "@/lib/persistence";
import { normalizeResume } from "@/lib/resume/normalizeResume";
import { createResumeSlice } from "./slices/createResumeSlice";
import { createSectionsSlice } from "./slices/createSectionsSlice";
import { createThemeSlice } from "./slices/createThemeSlice";
import { createUiSlice } from "./slices/createUiSlice";
import type { RootStore } from "./types";

export const useResumeStore = create<RootStore>()((...sliceArgs) => ({
  ...createResumeSlice(...sliceArgs),
  ...createSectionsSlice(...sliceArgs),
  ...createThemeSlice(...sliceArgs),
  ...createUiSlice(...sliceArgs),
}));

const AUTOSAVE_DELAY_MS = 600;

const persistResume = debounce((resume: RootStore["resume"]) => {
  useResumeStore.getState().setSaveStatus("saving");
  void resumeRepository.save(resume).then(() => {
    useResumeStore.getState().setSaveStatus("saved");
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
}

let stopAutosave: (() => void) | null = null;

export function startAutosave(): () => void {
  if (stopAutosave) return stopAutosave;

  stopAutosave = useResumeStore.subscribe((state, previousState) => {
    if (state.resume !== previousState.resume) {
      persistResume(state.resume);
    }
  });

  return stopAutosave;
}
