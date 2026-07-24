/**
 * Deferred-download coordination for the login-gated PDF export.
 *
 * A guest who clicks download is sent to the /login modal; the click intent is
 * remembered here, and once the session exists AND the guest resume has been
 * merged AND the store re-hydrated (all inside AuthGate's ResumeSession),
 * {@link firePendingDownload} re-triggers the download — the user never re-does
 * anything. The flag lives in sessionStorage (per-tab) so it also survives the
 * Google OAuth full-page redirect; the handler is module-level and re-bound on
 * mount because the editor tree remounts on the auth flip (key={status}).
 */
const PENDING_KEY = "ai-res:pendingDownload";

let handler: (() => void) | null = null;

/** Remember that a download was requested and is waiting on a login. */
export function requestDownloadAfterLogin(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(PENDING_KEY, "1");
}

/** Drop the pending download (login modal dismissed without signing in). */
export function cancelPendingDownload(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(PENDING_KEY);
}

/** The live download trigger (registered by useDownloadPdf on mount). */
export function registerPendingDownloadHandler(fn: () => void): () => void {
  handler = fn;
  return () => {
    if (handler === fn) handler = null;
  };
}

/** Fire the deferred download once — called after login + merge + hydration. */
export function firePendingDownload(): void {
  if (typeof window === "undefined" || !handler) return;
  if (window.sessionStorage.getItem(PENDING_KEY) !== "1") return;
  window.sessionStorage.removeItem(PENDING_KEY);
  handler();
}
