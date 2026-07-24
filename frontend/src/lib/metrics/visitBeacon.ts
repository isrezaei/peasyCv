import { recordVisit } from "@/lib/api/admin";
import { createId } from "@/lib/utils/id";

/**
 * Daily visitor beacon. "Visitor" = an opaque random id minted once per browser
 * and kept in localStorage — first-party, no IP, no user agent, never joined to
 * an account. Fired at most once per UTC day per browser (throttled locally;
 * the backend's [visitorId, date] unique constraint dedups regardless), and
 * only from the editor app mount — the headless /print render and the public
 * /share view never call this.
 */
const VISITOR_ID_KEY = "ai-res:visitorId";
const LAST_PING_KEY = "ai-res:lastVisitPing";

export function pingDailyVisit(): void {
  if (typeof window === "undefined") return;

  const today = new Date().toISOString().slice(0, 10);
  if (window.localStorage.getItem(LAST_PING_KEY) === today) return;

  let visitorId = window.localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = createId();
    window.localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }

  // Mark first so a slow request can't double-fire; unmark on failure so the
  // next load retries.
  window.localStorage.setItem(LAST_PING_KEY, today);
  void recordVisit(visitorId).catch(() => {
    window.localStorage.removeItem(LAST_PING_KEY);
  });
}
