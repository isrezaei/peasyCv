export interface Debounced<Args extends unknown[]> {
  (...args: Args): void;
  cancel: () => void;
  /** Run the pending call (if any) right now, with its latest arguments. */
  flush: () => void;
}

export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  waitMs: number,
): Debounced<Args> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Args | null = null;

  const debounced = (...args: Args) => {
    lastArgs = args;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      const args = lastArgs;
      lastArgs = null;
      if (args) fn(...args);
    }, waitMs);
  };

  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    lastArgs = null;
  };

  // Used to persist synchronously before the tab is hidden/closed so a recent
  // edit is never lost while still inside the debounce window.
  debounced.flush = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (lastArgs) {
      const args = lastArgs;
      lastArgs = null;
      fn(...args);
    }
  };

  return debounced;
}
