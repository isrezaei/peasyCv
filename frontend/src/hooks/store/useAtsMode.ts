import { useResumeStore } from "@/store/useResumeStore";

/**
 * Whether the résumé is in ATS Friendly mode. Read straight from the store so any
 * leaf decoration component (timeline rail, contact icons, skill chips, bullets…)
 * can drop its graphic without the templates having to prop-drill the flag. Works
 * identically in the editor and on the headless /print surface — both hydrate the
 * same store.
 */
export function useAtsMode(): boolean {
  return useResumeStore((state) => state.resume.theme.atsMode);
}
