"use client";

import { Box, chakra, HStack, Popover, Portal } from "@chakra-ui/react";
import { useState } from "react";
import { useDateCalendar } from "@/hooks/store/useDateCalendar";
import { CALENDAR_SYSTEMS } from "@/lib/dates/calendars";
import { dateObjectToISO, formatStoredDate, todayInSystem } from "@/lib/dates/format";
import { t } from "@/lib/i18n";
import type { CalendarSystem } from "@/types";
import { CalendarPicker } from "./CalendarPicker";

interface DateFieldProps {
  /** Selected date as canonical ISO (Gregorian), or "" when unset. */
  value: string;
  onChange: (iso: string) => void;
  placeholder: string;
  fontSize?: string;
  color?: string;
}

const SYSTEM_LABELS: Record<CalendarSystem, string> = {
  jalali: t.calendars.jalaliShort,
  hijri: t.calendars.hijriShort,
  gregorian: t.calendars.gregorianShort,
};

/**
 * Inline date control: reads as plain, calendar-localized resume text (so it
 * prints identically to a static label) but opens a themed calendar popover for
 * editing. Dates round-trip through canonical ISO; the displayed calendar system
 * (Jalali / Hijri / Gregorian) is the shared presentation setting and can be
 * switched right inside the popover.
 */
export function DateField({
  value,
  onChange,
  placeholder,
  fontSize = "xs",
  color = "fg.muted",
}: DateFieldProps) {
  const { calendar, setDateCalendar } = useDateCalendar();
  const [open, setOpen] = useState(false);

  const display = formatStoredDate(value, calendar);

  const handleSelect = (iso: string) => {
    onChange(iso);
    setOpen(false);
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(details) => setOpen(details.open)}
      positioning={{ placement: "bottom-start" }}
      lazyMount
      unmountOnExit
    >
      <Popover.Trigger asChild>
        <chakra.button
          type="button"
          dir={"rtl"}
          aria-label={t.calendars.pickDate}
          width="full"
          textAlign="start"
          border="none"
          bg="transparent"
          px="0"
          py="0"
          borderRadius="sm"
          fontSize={fontSize}
          fontFamily="inherit"
          lineHeight="inherit"
          color={display ? color : "fg.subtle"}
          transition="background 0.12s"
          cursor={"pointer"}
        >
          {display || placeholder}
        </chakra.button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content
            width="auto"
            borderRadius="2xl"
            borderWidth="1px"
            borderColor="blackAlpha.100"
            boxShadow="lg"
            bg="white"
            overflow="hidden"
            className="no-print"
          >
            <Popover.Body p="3">
              {/* Calendar-system switcher (shared presentation setting). */}
              <HStack
                gap="1"
                mb="3"
                p="0.5"
                bg="bg.muted"
                borderRadius="lg"
                dir="rtl"
              >
                {CALENDAR_SYSTEMS.map((system) => {
                  const active = calendar === system;
                  return (
                    <chakra.button
                      key={system}
                      type="button"
                      flex="1"
                      py="1"
                      borderRadius="md"
                      fontSize="2xs"
                      fontWeight="medium"
                      whiteSpace="nowrap"
                      bg={active ? "white" : "transparent"}
                      color={active ? "accent.fg" : "fg.muted"}
                      boxShadow={active ? "sm" : "none"}
                      transition="background 0.12s, color 0.12s"
                      _hover={active ? undefined : { color: "fg" }}
                      onClick={() => setDateCalendar(system)}
                    >
                      {SYSTEM_LABELS[system]}
                    </chakra.button>
                  );
                })}
              </HStack>

              <CalendarPicker value={value} system={calendar} onSelect={handleSelect} />

              <HStack justify="space-between" mt="2" dir="rtl">
                <chakra.button
                  type="button"
                  fontSize="2xs"
                  fontWeight="medium"
                  color="accent.fg"
                  px="1.5"
                  py="1"
                  borderRadius="md"
                  _hover={{ bg: "accent.subtle" }}
                  onClick={() => handleSelect(dateObjectToISO(todayInSystem(calendar)))}
                >
                  {t.calendars.today}
                </chakra.button>
                {value ? (
                  <chakra.button
                    type="button"
                    fontSize="2xs"
                    fontWeight="medium"
                    color="fg.muted"
                    px="1.5"
                    py="1"
                    borderRadius="md"
                    _hover={{ bg: "blackAlpha.50", color: "red.fg" }}
                    onClick={() => handleSelect("")}
                  >
                    {t.calendars.clear}
                  </chakra.button>
                ) : (
                  <Box />
                )}
              </HStack>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
