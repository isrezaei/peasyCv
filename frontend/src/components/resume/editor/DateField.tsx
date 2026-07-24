"use client";

import { Box, chakra, HStack, Popover, Portal } from "@chakra-ui/react";
import { useState } from "react";
import { useDateCalendar } from "@/hooks/store/useDateCalendar";
import { CALENDAR_SYSTEMS } from "@/lib/dates/calendars";
import {
  dateObjectToISO,
  formatStoredDate,
  todayInSystem,
} from "@/lib/dates/format";
import { t } from "@/lib/i18n";
import type { CalendarSystem } from "@/types";
import { CalendarPicker } from "./CalendarPicker";
import { EMPTY_HIGHLIGHT_COLOR } from "./EditableText";
import { useEmptyHighlightActive } from "./EmptyHighlightContext";
import { MonthYearPicker } from "./MonthYearPicker";
import { usePrintText } from "./PrintTextContext";

interface DateFieldProps {
  /** Selected date as canonical ISO (Gregorian), or "" when unset. */
  value: string;
  onChange: (iso: string) => void;
  placeholder: string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  /**
   * Month + year precision, Jalali only (no day grid, no calendar-system
   * switcher). Used for employment / study periods — the only precision a resume
   * date needs. Storage stays canonical ISO so the PDF render is unaffected.
   */
  monthYear?: boolean;
  /**
   * Display format token (e.g. from `periodDateFormat`). Presentation only — the
   * stored value stays the full ISO date, so hiding the month loses nothing.
   */
  format?: string;
  /**
   * "Until now" support for an end date. When `onPresentChange` is provided the
   * popover shows a «تا اکنون» toggle and the trigger renders that label while
   * `present` is true, marking an ongoing role instead of a fixed end date.
   */
  present?: boolean;
  onPresentChange?: (present: boolean) => void;
  /**
   * Opt this date into download-time empty-field validation (same contract as
   * EditableText's `validate`): when a blocked download turns the highlights on
   * and the date is still unset, the trigger's placeholder text turns the literal
   * validation red and the button opts into the shake via `data-empty-highlight`.
   * An ongoing role (`present`) counts as filled, so it never highlights.
   */
  validate?: boolean;
}

const SYSTEM_LABELS: Record<CalendarSystem, string> = {
  jalali: t.calendars.jalaliShort,
  hijri: t.calendars.hijriShort,
  gregorian: t.calendars.gregorianShort,
};

/**
 * Inline date control: reads as plain, calendar-localized resume text (so it
 * prints identically to a static label) but opens a themed calendar popover for
 * editing. Dates round-trip through canonical ISO. In `monthYear` mode it is a
 * Jalali month/year picker (employment / study periods); otherwise it is the
 * full day-precision picker whose calendar system can be switched in the popover.
 */
export function DateField({
  value,
  onChange,
  placeholder,
  fontSize = "xs",
  color = "fg.muted",
  fontWeight = "normal",
  monthYear = false,
  format,
  present = false,
  onPresentChange,
  validate,
}: DateFieldProps) {
  const { calendar, setDateCalendar } = useDateCalendar();
  const [open, setOpen] = useState(false);

  // Month/year fields are Jalali-only for now; day fields follow the shared setting.
  const system: CalendarSystem = monthYear ? "jalali" : calendar;
  const display = present
    ? t.calendars.present
    : formatStoredDate(value, system, format);

  // Empty-field validation marker (editor-only, same contract as EditableText):
  // an unset, non-ongoing date that opted in gets the red placeholder + the shake
  // hook while a blocked download has the highlights on. Never provided on
  // /print (usePrintText short-circuits above), so it can't reach a PDF.
  const highlightActive = useEmptyHighlightActive();
  const showEmptyHighlight = Boolean(validate) && highlightActive && !present && !value;

  // Print surface: the date is a real text node (never the picker button), so the
  // PDF carries extractable text and an unset date prints nothing — the button's
  // placeholder label is an editor-only affordance.
  const plainText = usePrintText();
  if (plainText) {
    if (!display) return null;
    return (
      <chakra.span
        display="block"
        dir="rtl"
        textAlign="start"
        fontSize={fontSize}
        fontWeight={fontWeight}
        fontFamily="inherit"
        lineHeight="inherit"
        color={color}
        // The editor renders this date as a non-wrapping picker button; keep the
        // print text node one line too. Without these, a sibling width-100% text
        // field (the certification issuer) flex-squeezes this span and the date
        // wraps to a second line that only exists on /print — painting the row
        // taller than the editor and the height estimate.
        whiteSpace="nowrap"
        flexShrink={0}
      >
        {display}
      </chakra.span>
    );
  }

  const handleSelect = (iso: string) => {
    onChange(iso);
    onPresentChange?.(false);
    setOpen(false);
  };
  const handlePresent = () => {
    onPresentChange?.(true);
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
          dir="rtl"
          aria-label={t.calendars.pickDate}
          {...(showEmptyHighlight ? { "data-empty-highlight": "true" } : null)}
          width="full"
          textAlign="start"
          border="none"
          bg="transparent"
          px="0"
          py="0"
          borderRadius="sm"
          fontSize={fontSize}
          fontWeight={fontWeight}
          fontFamily="inherit"
          lineHeight="inherit"
          // Flagged empty → the placeholder text turns the literal validation red
          // (a colour-only change, so it never shifts the row height/pagination).
          color={showEmptyHighlight ? EMPTY_HIGHLIGHT_COLOR : display ? color : "fg.subtle"}
          transition="background 0.12s"
          cursor="pointer"
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
            borderColor={{ base: "blackAlpha.100", _dark: "border" }}
            boxShadow="lg"
            bg="bg.panel"
            overflow="hidden"
            className="no-print"
          >
            <Popover.Body p="3">
              {/* Calendar-system switcher — day mode only (month/year is Jalali). */}
              {!monthYear ? (
                <HStack
                  gap="1"
                  mb="3"
                  p="0.5"
                  bg="bg.muted"
                  borderRadius="lg"
                  dir="rtl"
                >
                  {CALENDAR_SYSTEMS.map((option) => {
                    const active = calendar === option;
                    return (
                      <chakra.button
                        key={option}
                        type="button"
                        flex="1"
                        py="1"
                        borderRadius="md"
                        fontSize="2xs"
                        fontWeight="medium"
                        whiteSpace="nowrap"
                        bg={active ? { base: "white", _dark: "bg.emphasized" } : "transparent"}
                        color={active ? "accent.fg" : "fg.muted"}
                        boxShadow={active ? "sm" : "none"}
                        transition="background 0.12s, color 0.12s"
                        _hover={active ? undefined : { color: "fg" }}
                        onClick={() => setDateCalendar(option)}
                      >
                        {SYSTEM_LABELS[option]}
                      </chakra.button>
                    );
                  })}
                </HStack>
              ) : null}

              {monthYear ? (
                <MonthYearPicker
                  value={present ? "" : value}
                  system={system}
                  onSelect={handleSelect}
                />
              ) : (
                <CalendarPicker
                  value={value}
                  system={system}
                  onSelect={handleSelect}
                />
              )}

              <HStack justify="space-between" mt="2" dir="rtl">
                {onPresentChange ? (
                  // «تا اکنون» — mark an ongoing role (replaces the end date).
                  <chakra.button
                    type="button"
                    fontSize="2xs"
                    fontWeight="medium"
                    color={present ? "white" : "accent.fg"}
                    bg={present ? "accent.solid" : "transparent"}
                    px="1.5"
                    py="1"
                    borderRadius="md"
                    _hover={present ? undefined : { bg: "accent.subtle" }}
                    onClick={handlePresent}
                  >
                    {t.calendars.present}
                  </chakra.button>
                ) : (
                  <chakra.button
                    type="button"
                    fontSize="2xs"
                    fontWeight="medium"
                    color="accent.fg"
                    px="1.5"
                    py="1"
                    borderRadius="md"
                    _hover={{ bg: "accent.subtle" }}
                    onClick={() =>
                      handleSelect(dateObjectToISO(todayInSystem(system)))
                    }
                  >
                    {t.calendars.today}
                  </chakra.button>
                )}
                {value && !present ? (
                  <chakra.button
                    type="button"
                    fontSize="2xs"
                    fontWeight="medium"
                    color="fg.muted"
                    px="1.5"
                    py="1"
                    borderRadius="md"
                    _hover={{ bg: { base: "blackAlpha.50", _dark: "bg.muted" }, color: "red.fg" }}
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
