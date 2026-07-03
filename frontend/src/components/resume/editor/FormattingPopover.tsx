"use client";

import { HStack, IconButton } from "@chakra-ui/react";
import { memo, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { BoldIcon, ItalicIcon, UnderlineIcon } from "@/components/ui/icons";
import type { FormatCommand, InlineFormattingState } from "@/hooks/resume/useInlineFormatting";
import { t } from "@/lib/i18n";

interface FormattingPopoverProps {
  state: InlineFormattingState;
  onApply: (command: FormatCommand) => void;
}

/**
 * The small bold / italic / underline popover shown next to a selected word in
 * any rich-text field. Rendered through a portal at the selection's viewport
 * anchor so it floats above the page chrome without being clipped by the canvas.
 * `mousedown` is suppressed on the whole surface so clicking a control never
 * blurs the editable or collapses the selection the command must act on.
 */
export const FormattingPopover = memo(function FormattingPopover({
  state,
  onApply,
}: FormattingPopoverProps) {
  if (typeof document === "undefined" || !state.open) return null;

  const control = (command: FormatCommand, label: string, icon: ReactNode) => (
    <IconButton
      aria-label={label}
      aria-pressed={state.active[command]}
      size="2xs"
      variant={state.active[command] ? "solid" : "ghost"}
      colorPalette={state.active[command] ? "blue" : "gray"}
      onClick={() => onApply(command)}
    >
      {icon}
    </IconButton>
  );

  return createPortal(
    <HStack
      data-formatting-popover
      className="no-print"
      position="fixed"
      top={`${state.top}px`}
      left={`${state.left}px`}
      transform="translate(-50%, -100%)"
      zIndex={1500}
      gap="0.5"
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
      boxShadow="md"
      px="1"
      py="1"
      onMouseDown={(event) => event.preventDefault()}
    >
      {control("bold", t.sectionToolbar.bold, <BoldIcon />)}
      {control("italic", t.sectionToolbar.italic, <ItalicIcon />)}
      {control("underline", t.sectionToolbar.underline, <UnderlineIcon />)}
    </HStack>,
    document.body,
  );
});
