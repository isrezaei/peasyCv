"use client";

import { Box, chakra, Grid, HStack, IconButton, Text } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import DateObject from "react-date-object";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { dateObjectToISO, isoToDateObject, todayInSystem } from "@/lib/dates/format";
import { t } from "@/lib/i18n";
import type { CalendarSystem } from "@/types";

interface MonthYearPickerProps {
  /** Currently selected date as canonical ISO (Gregorian), or "" when unset. */
  value: string;
  system: CalendarSystem;
  onSelect: (iso: string) => void;
}

/**
 * Month + year picker rendered in a single calendar system (employment / study
 * periods only need month-level precision). A year header steps the view; the
 * 12-month grid selects a month, reported back as the ISO date of that month's
 * first day so storage stays canonical Gregorian and round-trips into the PDF.
 * Used by {@link DateField} in its `monthYear` mode (Jalali only, for now).
 */
export function MonthYearPicker({ value, system, onSelect }: MonthYearPickerProps) {
  // Anchor the view on the year of the selected value (or today), tracked as the
  // ISO of its month's first day so a system switch re-derives the same instant.
  const [anchorISO, setAnchorISO] = useState(() => firstOfMonthISO(value, system));

  // Adjust the view when the value/system changes while open (no effect needed).
  const viewKey = `${value}|${system}`;
  const [seenKey, setSeenKey] = useState(viewKey);
  if (seenKey !== viewKey) {
    setSeenKey(viewKey);
    setAnchorISO(firstOfMonthISO(value, system));
  }

  const selected = useMemo(() => isoToDateObject(value, system), [value, system]);
  const today = useMemo(() => todayInSystem(system), [system]);

  const monthStart = useMemo(() => {
    const fromAnchor = isoToDateObject(anchorISO, system) ?? todayInSystem(system);
    return new DateObject(fromAnchor).toFirstOfMonth();
  }, [anchorISO, system]);

  const shiftYear = (delta: number) => {
    const next = new DateObject(monthStart).add(delta, "year").toFirstOfMonth();
    setAnchorISO(dateObjectToISO(next));
  };

  return (
    <Box width="252px" dir="rtl">
      <HStack justify="space-between" align="center" mb="2">
        {/* DOM order is right-to-left: prev (earlier) on the right, next on the left. */}
        <IconButton
          aria-label={t.calendars.prevYear}
          size="2xs"
          variant="ghost"
          colorPalette="gray"
          onClick={() => shiftYear(-1)}
        >
          <ChevronRightIcon />
        </IconButton>
        <Text fontSize="sm" fontWeight="semibold" color="fg.muted">
          {monthStart.format("YYYY")}
        </Text>
        <IconButton
          aria-label={t.calendars.nextYear}
          size="2xs"
          variant="ghost"
          colorPalette="gray"
          onClick={() => shiftYear(1)}
        >
          <ChevronLeftIcon />
        </IconButton>
      </HStack>

      <Grid templateColumns="repeat(3, 1fr)" gap="1">
        {monthStart.months.map((month) => {
          const cell = new DateObject(monthStart).setMonth(month.number).setDay(1);
          const iso = dateObjectToISO(cell);
          const isSelected =
            selected?.year === monthStart.year && selected?.month.number === month.number;
          const isCurrent =
            today.year === monthStart.year && today.month.number === month.number;
          return (
            <chakra.button
              key={month.number}
              type="button"
              onClick={() => onSelect(iso)}
              aria-pressed={isSelected}
              height="9"
              borderRadius="lg"
              fontSize="xs"
              fontWeight={isSelected ? "bold" : "normal"}
              bg={isSelected ? "accent.solid" : "transparent"}
              color={isSelected ? "white" : isCurrent ? "accent.fg" : "fg.muted"}
              borderWidth={isCurrent && !isSelected ? "1px" : "0"}
              borderColor="accent.emphasized"
              transition="background 0.1s"
              _hover={isSelected ? undefined : { bg: "accent.subtle" }}
            >
              {month.name}
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
