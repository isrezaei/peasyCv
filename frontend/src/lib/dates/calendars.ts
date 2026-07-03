import type { Calendar, Locale } from "react-date-object";
import arabic from "react-date-object/calendars/arabic";
import gregorian from "react-date-object/calendars/gregorian";
import persian from "react-date-object/calendars/persian";
import arabic_fa from "react-date-object/locales/arabic_fa";
import gregorian_fa from "react-date-object/locales/gregorian_fa";
import persian_fa from "react-date-object/locales/persian_fa";
import type { CalendarSystem } from "@/types";

export interface CalendarConfig {
  calendar: Calendar;
  locale: Locale;
}

/**
 * Maps each {@link CalendarSystem} to a react-date-object calendar + locale.
 * - jalali → Persian (Hijri Shamsi), the astronomical "persian" calendar.
 * - hijri  → Arabic (Hijri Qamari / lunar), month names rendered in Persian.
 * - gregorian → Gregorian, rendered with Persian month names + digits so the
 *   RTL UI stays visually consistent.
 * Persian-script locales also give us Persian (Eastern Arabic) digits for free.
 */
const CONFIG: Record<CalendarSystem, CalendarConfig> = {
  jalali: { calendar: persian, locale: persian_fa },
  hijri: { calendar: arabic, locale: arabic_fa },
  gregorian: { calendar: gregorian, locale: gregorian_fa },
};

export function getCalendarConfig(system: CalendarSystem): CalendarConfig {
  return CONFIG[system];
}

/** The Gregorian calendar is the canonical system used for stored ISO dates. */
export const gregorianCalendar = gregorian;

export const CALENDAR_SYSTEMS: CalendarSystem[] = ["jalali", "hijri", "gregorian"];
