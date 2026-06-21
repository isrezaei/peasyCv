// react-date-object ships its calendar/locale data as untyped CommonJS subpath
// modules (only the package root has a bundled .d.ts). These ambient
// declarations give the calendars and locales we use proper types so the date
// utilities and calendar UI stay fully typed under `tsc --noEmit`.
declare module "react-date-object/calendars/persian" {
  import type { Calendar } from "react-date-object";
  const calendar: Calendar;
  export default calendar;
}

declare module "react-date-object/calendars/arabic" {
  import type { Calendar } from "react-date-object";
  const calendar: Calendar;
  export default calendar;
}

declare module "react-date-object/calendars/gregorian" {
  import type { Calendar } from "react-date-object";
  const calendar: Calendar;
  export default calendar;
}

declare module "react-date-object/locales/persian_fa" {
  import type { Locale } from "react-date-object";
  const locale: Locale;
  export default locale;
}

declare module "react-date-object/locales/arabic_fa" {
  import type { Locale } from "react-date-object";
  const locale: Locale;
  export default locale;
}

declare module "react-date-object/locales/gregorian_fa" {
  import type { Locale } from "react-date-object";
  const locale: Locale;
  export default locale;
}
