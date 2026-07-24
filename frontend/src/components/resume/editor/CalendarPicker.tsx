"use client";

import { Box, chakra, Grid, HStack, IconButton, Text } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import DateObject from "react-date-object";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "@/components/ui/icons";
import { dateObjectToISO, isoToDateObject, todayInSystem } from "@/lib/dates/format";
import { t } from "@/lib/i18n";
import type { CalendarSystem } from "@/types";

interface CalendarPickerProps {
  /** Currently selected date as canonical ISO (Gregorian), or "" when unset. */
  value: string;
  system: CalendarSystem;
  onSelect: (iso: string) => void;
}

/**
 * A self-contained month grid rendered in a single calendar system (Jalali,
 * Hijri Qamari, or Gregorian). All arithmetic flows through react-date-object so
 * leap years and month lengths are correct per calendar. The grid is RTL by
 * inheritance, so column 0 (the locale's first week-day) sits on the right and
 * aligns with its header. Selection is reported back as a Gregorian ISO date.
 */
export function CalendarPicker({ value, system, onSelect }: CalendarPickerProps) {
  // The displayed month, anchored as the ISO date of its first day so switching
  // calendar system re-derives the same point in time in the new calendar.
  const [anchorISO, setAnchorISO] = useState(() => firstOfMonthISO(value, system));

  // When the selected value or calendar system changes (e.g. the user switches
  // Jalali → Hijri while open), jump the view to the relevant month. This is the
  // React-recommended "adjust state during render" pattern — no effect needed.
  const viewKey = `${value}|${system}`;
  const [seenKey, setSeenKey] = useState(viewKey);
  if (seenKey !== viewKey) {
    setSeenKey(viewKey);
    setAnchorISO(firstOfMonthISO(value, system));
  }

  const todayISO = useMemo(() => dateObjectToISO(todayInSystem(system)), [system]);

  const monthStart = useMemo(() => {
    const fromAnchor = isoToDateObject(anchorISO, system) ?? todayInSystem(system);
    return new DateObject(fromAnchor).toFirstOfMonth();
  }, [anchorISO, system]);

  const weekDayHeaders = monthStart.weekDays.map((day) => day.shortName);
  const leadingBlanks = monthStart.weekDay.index;
  const daysInMonth = monthStart.month.length;

  const shiftMonth = (delta: number) => {
    const next = new DateObject(monthStart).add(delta, "month").toFirstOfMonth();
    setAnchorISO(dateObjectToISO(next));
  };
  const shiftYear = (delta: number) => {
    const next = new DateObject(monthStart).add(delta, "year").toFirstOfMonth();
    setAnchorISO(dateObjectToISO(next));
  };

  return (
    <Box width="252px" dir="rtl">
      <HStack justify="space-between" align="center" mb="2">
        {/* DOM order is right-to-left under dir=rtl: earlier (prev) buttons sit
            on the right, later (next) buttons on the left. */}
        <HStack gap="0.5">
          <IconButton
            aria-label={t.calendars.prevYear}
            size="2xs"
            variant="ghost"
            colorPalette="gray"
            onClick={() => shiftYear(-1)}
          >
            <ChevronsRightIcon />
          </IconButton>
          <IconButton
            aria-label={t.calendars.prevMonth}
            size="2xs"
            variant="ghost"
            colorPalette="gray"
            onClick={() => shiftMonth(-1)}
          >
            <ChevronRightIcon />
          </IconButton>
        </HStack>

        <Text fontSize="sm" fontWeight="semibold" color="fg.muted" lineClamp={1}>
          {monthStart.format("MMMM YYYY")}
        </Text>

        <HStack gap="0.5">
          <IconButton
            aria-label={t.calendars.nextMonth}
            size="2xs"
            variant="ghost"
            colorPalette="gray"
            onClick={() => shiftMonth(1)}
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            aria-label={t.calendars.nextYear}
            size="2xs"
            variant="ghost"
            colorPalette="gray"
            onClick={() => shiftYear(1)}
          >
            <ChevronsLeftIcon />
          </IconButton>
        </HStack>
      </HStack>

      <Grid templateColumns="repeat(7, 1fr)" gap="0.5" mb="1">
        {weekDayHeaders.map((label, index) => (
          <Text
            key={`${label}-${index}`}
            textAlign="center"
            fontSize="2xs"
            fontWeight="medium"
            color="fg.subtle"
            py="0.5"
          >
            {label}
          </Text>
        ))}
      </Grid>

      <Grid templateColumns="repeat(7, 1fr)" gap="0.5">
        {Array.from({ length: leadingBlanks }).map((_, index) => (
          <Box key={`blank-${index}`} aria-hidden />
        ))}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const dayDate = new DateObject(monthStart).setDay(day);
          const iso = dateObjectToISO(dayDate);
          const isSelected = iso === value;
          const isToday = iso === todayISO;
          return (
            <chakra.button
              key={iso}
              type="button"
              onClick={() => onSelect(iso)}
              aria-pressed={isSelected}
              height="8"
              borderRadius="lg"
              fontSize="xs"
              fontWeight={isSelected ? "bold" : "normal"}
              bg={isSelected ? "accent.solid" : "transparent"}
              color={isSelected ? "accent.contrast" : isToday ? "accent.fg" : "fg.muted"}
              borderWidth={isToday && !isSelected ? "1px" : "0"}
              borderColor="accent.emphasized"
              transition="background 0.1s"
              _hover={isSelected ? undefined : { bg: "accent.subtle" }}
            >
              {dayDate.format("DD")}
            </chakra.button>
          );
        })}
      </Grid>
    </Box>
  );
}

/** ISO date of the first day of the month that contains `value` (or today). */
function firstOfMonthISO(value: string, system: CalendarSystem): string {
  const base = isoToDateObject(value, system) ?? todayInSystem(system);
  return dateObjectToISO(new DateObject(base).toFirstOfMonth());
}
