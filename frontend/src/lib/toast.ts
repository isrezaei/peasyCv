import toast from "react-hot-toast";
import { t } from "@/lib/i18n";

/**
 * Typed wrappers around `react-hot-toast` so toasts are never constructed ad hoc
 * inside components. The single mounted `<Toaster>` and its styling live in
 * `app/providers.tsx`; this module only fires toasts.
 *
 * `react-hot-toast` is the ONLY toast system here — Chakra v3's `createToaster`
 * is deliberately not used.
 */

// Fixed id → repeated blocked download attempts reuse one toast instead of
// stacking a new one each time.
const VALIDATION_TOAST_ID = "required-fields";

/**
 * Fire the "complete these fields" validation toast — a single line using the
 * library's built-in error state (default red icon + animations). It NEVER lists
 * the empty field names; the editor's per-field red highlights do that in place.
 */
export function showValidationToast(): void {
  toast.error(t.downloadValidation.title, { id: VALIDATION_TOAST_ID });
}
