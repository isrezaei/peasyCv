import DateObject from "react-date-object";
import type { CalendarSystem } from "@/types";
import { getCalendarConfig, gregorianCalendar } from "./calendars";

/** Canonical stored shape: an ISO calendar date (Gregorian), e.g. "2021-09-01". */
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Default display token for resume dates — month name + year (e.g. «خرداد ۱۴۰۰»). */
export const DEFAULT_DATE_FORMAT = "MMMM YYYY";

export function isStoredDate(value: string): boolean {
  return ISO_DATE_RE.test(value);
}

/** Serialize a DateObject (in any calendar) to a canonical Gregorian ISO date. */
export function dateObjectToISO(date: DateObject): string {
  const gregorian = new DateObject(date).convert(gregorianCalendar);
  const year = String(gregorian.year).padStart(4, "0");
  const month = String(gregorian.month.number).padStart(2, "0");
  const day = String(gregorian.day).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse a stored ISO date into a DateObject expressed in the requested calendar
 * system (with its locale, so formatting yields localized month names/digits).
 * Returns null for empty or non-ISO (legacy free-text) values.
 */
export function isoToDateObject(value: string, system: CalendarSystem): DateObject | null {
  if (!isStoredDate(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const { calendar, locale } = getCalendarConfig(system);
  const date = new DateObject({ calendar: gregorianCalendar, year, month, day });
  return date.convert(calendar, locale);
}

/**
 * Render a stored date for display in the chosen calendar system. Empty values
 * render empty; values that aren't canonical ISO (e.g. older free-text entries)
 * are returned verbatim so no previously entered data is ever lost.
 */
export function formatStoredDate(
  value: string,
  system: CalendarSystem,
  format: string = DEFAULT_DATE_FORMAT,
): string {
  if (!value) return "";
  const date = isoToDateObject(value, system);
  if (!date) return value;
  return date.format(format);
}

/** A fresh DateObject for "today" in the given calendar system + locale. */
export function todayInSystem(system: CalendarSystem): DateObject {
  const { calendar, locale } = getCalendarConfig(system);
  return new DateObject({ calendar, locale });
}
