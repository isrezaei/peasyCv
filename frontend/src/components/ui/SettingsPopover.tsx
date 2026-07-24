"use client";

import { chakra, HStack, IconButton, Popover, Portal, Text } from "@chakra-ui/react";
import { useState, type ReactNode } from "react";
import { t } from "@/lib/i18n";
import { CloseIcon, GearIcon } from "./icons";

interface SettingsPopoverProps {
  /** Heading shown at the top of the panel. */
  title: string;
  /** Accessible label for the trigger. */
  triggerLabel: string;
  children: ReactNode;
  triggerSize?: "2xs" | "xs" | "sm";
  /** Trigger glyph — defaults to the gear; the dots HoverFrame passes 3-dots. */
  icon?: ReactNode;
  /**
   * Resting opacity for the trigger. When set the trigger becomes the "dots"
   * HoverFrame: a BARE 3-dots glyph (no button skin) painted in the resume accent.
   * It rests faint, carries the `data-hover-frame` marker (so a section reveal
   * lifts it) and stays full while the popover is open.
   */
  triggerRest?: number;
  /**
   * Accepted for call-site compatibility. The dots HoverFrame is now a bare,
   * accent-coloured glyph that reads on any surface, so the surrounding tone no
   * longer changes its presentation.
   */
  tone?: "onLight" | "onDark";
  /**
   * Fully custom trigger element (rendered via `asChild`), for surfaces whose
   * chrome the trigger must match exactly — e.g. the per-item gear mirroring
   * the item trash button. Overrides the built-in dots / icon-button triggers;
   * the caller owns the trigger's styling, including its reveal states.
   */
  trigger?: ReactNode;
}

/** Bare-dots glyph size per trigger size — chrome only, never in the PDF. */
const DOTS_FONT_SIZE = { "2xs": "md", xs: "lg", sm: "xl" } as const;

/**
 * A controlled trigger → popover used for every settings surface. The close
 * behaviour is reliable (outside-click + Escape flow through `onOpenChange`), and
 * the panel is a clean, soft, well-spaced card. In "dots" mode (when `triggerRest`
 * is set) the trigger is a BARE 3-dots glyph — no button skin — painted in the
 * resume accent so it reads on any surface while sitting quietly on the layout.
 */
export function SettingsPopover({
  title,
  triggerLabel,
  children,
  triggerSize = "xs",
  icon,
  triggerRest,
  trigger,
}: SettingsPopoverProps) {
  const [open, setOpen] = useState(false);
  const dots = triggerRest != null;

  return (
    <Popover.Root
      open={open}
      onOpenChange={(details) => setOpen(details.open)}
      positioning={{ placement: "bottom-end" }}
      lazyMount
      unmountOnExit
    >
      <Popover.Trigger asChild>
        {trigger ?? (dots ? (
          // Dots HoverFrame: JUST the glyph — no button background or container.
          // It follows the resume's chosen accent (the per-column secondary tier
          // var, never a neutral/black) and lifts to full on section hover/open.
          <chakra.button
            type="button"
            aria-label={triggerLabel}
            className="no-print"
            data-hover-frame="true"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            bg="transparent"
            cursor="pointer"
            lineHeight="1"
            color="var(--rz-secondary, currentColor)"
            fontSize={DOTS_FONT_SIZE[triggerSize]}
            opacity={open ? 1 : triggerRest}
            transition="opacity 0.15s ease"
            _hover={{ opacity: 1 }}
            _focusVisible={{
              opacity: 1,
              outlineWidth: "2px",
              outlineStyle: "solid",
              outlineColor: "currentColor",
              outlineOffset: "2px",
              borderRadius: "sm",
            }}
          >
            {icon ?? <GearIcon />}
          </chakra.button>
        ) : (
          <IconButton
            aria-label={triggerLabel}
            size={triggerSize}
            colorPalette="gray"
            variant={open ? "solid" : "subtle"}
            borderRadius="xl"
            className="no-print"
            transition="background 0.15s ease, color 0.15s ease"
            boxShadow="xs"
          >
            {icon ?? <GearIcon />}
          </IconButton>
        ))}
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content
            width="244px"
            borderRadius="2xl"
            bg="bg.panel"
            borderWidth="1px"
            borderColor="border"
            boxShadow="lg"
            overflow="hidden"
            className="no-print"
          >
            <HStack justify="space-between" align="center" px="3" pt="2.5" pb="1.5">
              <Text fontSize="xs"  color="fg.muted" lineClamp={1}>
                {title}
              </Text>
              <Popover.CloseTrigger asChild>
                <IconButton
                  aria-label={t.ads.close}
                  size="2xs"
                  variant="ghost"
                  colorPalette="gray"
                  borderRadius="full"
                >
                  <CloseIcon />
                </IconButton>
              </Popover.CloseTrigger>
            </HStack>
            <Popover.Body px="2.5" pt="0.5" pb="3">
              {children}
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
