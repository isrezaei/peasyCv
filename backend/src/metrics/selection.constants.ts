/**
 * The selection-analytics dimensions. ONE generic SelectionEvent table keyed by
 * `kind` powers all of them, so adding a dimension is a one-line change here:
 * list its kind, the allowed id set (reused from the résumé validation
 * constants, so it can never drift), and the DownloadEvent snapshot column the
 * download-by-option aggregate groups on. "font" is already wired — it was
 * literally one line.
 */
import {
  BACKGROUND_PATTERNS,
  FONT_FAMILIES,
  TEMPLATE_IDS,
  THEME_IDS,
} from '../resumes/resume.constants';

export type SelectionKind = 'background' | 'theme' | 'template' | 'font';

export const SELECTION_KINDS: SelectionKind[] = ['background', 'theme', 'template', 'font'];

/** DownloadEvent column holding this dimension's value at render time. */
export const SELECTION_DOWNLOAD_COLUMN: Record<SelectionKind, string> = {
  background: 'backgroundPattern',
  theme: 'themeId',
  template: 'templateId',
  font: 'fontId',
};

/** Allowed ids per kind — junk values are dropped, not recorded. */
const ALLOWED_VALUES: Record<SelectionKind, ReadonlySet<string>> = {
  background: new Set(BACKGROUND_PATTERNS),
  theme: new Set(THEME_IDS),
  template: new Set(TEMPLATE_IDS),
  font: new Set(FONT_FAMILIES),
};

export function isValidSelection(kind: SelectionKind, value: string): boolean {
  return ALLOWED_VALUES[kind].has(value);
}
