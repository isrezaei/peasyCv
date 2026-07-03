"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { beginFieldEdit, endFieldEdit, registerFieldFlush } from "@/store/useResumeStore";

/** Inactivity window after which a deferred edit is committed to the store. */
const DEFAULT_DELAY_MS = 500;

interface DeferredCommit<T> {
  /** Live value to render in the field (local state, never lags the keystrokes). */
  value: T;
  /** Record a local edit; the store commit is debounced. */
  setValue: (next: T) => void;
  /** Commit any pending edit immediately (wire to onBlur). */
  flush: () => void;
}

/**
 * Defer committing a continuously-edited field to the global Zustand store until
 * the user pauses (debounced) or leaves the field, instead of writing on every
 * keystroke. The visible input is driven by the returned `value` so typing stays
 * perfectly responsive, while the expensive store update + pagination recompute
 * happens at most once per pause — the whole point on low-end machines.
 *
 * Nothing is lost: the pending value is flushed on blur (caller wires `flush`),
 * on unmount, and before the tab is hidden/closed (global flush registry). While
 * a value is uncommitted the field counts as "unsaved work" so the top-bar save
 * indicator reads «در حال ذخیره» until everything settles. The stored value is
 * unchanged — only *when* it is written differs, so schemas/contracts stay intact.
 */
export function useDeferredCommit<T>(
  committed: T,
  commit: (value: T) => void,
  delayMs: number = DEFAULT_DELAY_MS,
): DeferredCommit<T> {
  const [value, setLocal] = useState<T>(committed);

  // Refs let the debounce timer and the unmount/before-unload flush read the
  // latest value and callback without re-subscribing on every keystroke.
  const valueRef = useRef(value);
  const commitRef = useRef(commit);
  const dirtyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the latest commit callback reachable from the (stable) timer/flush
  // callbacks without making them change identity every render — a changing
  // commitNow would re-run the flush effect and defeat the debounce. valueRef is
  // kept current in setValue and the external-sync effect instead.
  useEffect(() => {
    commitRef.current = commit;
  });

  const commitNow = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!dirtyRef.current) return;
    dirtyRef.current = false;
    // Write to the store first (this hands off to the persist lifecycle), then
    // clear this field's pending mark — so the indicator never dips to «ذخیره شد»
    // in the gap between the commit and the scheduled persist.
    commitRef.current(valueRef.current);
    endFieldEdit();
  }, []);

  const setValue = useCallback(
    (next: T) => {
      setLocal(next);
      valueRef.current = next;
      if (!dirtyRef.current) {
        dirtyRef.current = true;
        beginFieldEdit();
      }
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(commitNow, delayMs);
    },
    [commitNow, delayMs],
  );

  const flush = useCallback(() => {
    commitNow();
  }, [commitNow]);

  // Adopt external value changes (undo, template switch, hydration) only while no
  // local edit is pending, so a deferred keystroke is never clobbered.
  useEffect(() => {
    if (!dirtyRef.current && committed !== valueRef.current) {
      setLocal(committed);
      valueRef.current = committed;
    }
  }, [committed]);

  // Flush on unmount (section/entry removal, navigation) and register for the
  // global before-unload flush so a value typed within the debounce window is
  // never lost on a hard reload either.
  useEffect(() => {
    const unregister = registerFieldFlush(commitNow);
    return () => {
      unregister();
      commitNow();
    };
  }, [commitNow]);

  return { value, setValue, flush };
}
