"use client";

import { Switch } from "@chakra-ui/react";

interface SwitchFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  colorPalette?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * A single labelled toggle row built on the Chakra v3 `Switch` namespace. The
 * whole row is the switch's label, so clicking the text toggles it too. Used by
 * every settings surface (header fields, per-section gear, arrangement panel) so
 * toggles look and behave identically everywhere.
 */
export function SwitchField({
  label,
  checked,
  onChange,
  colorPalette = "accent",
  size = "sm",
}: SwitchFieldProps) {
  return (
    <Switch.Root
      checked={checked}
      onCheckedChange={(details) => onChange(details.checked)}
      colorPalette={colorPalette}
      size={size}
      display="flex"
      width="100%"
      justifyContent="space-between"
      alignItems="center"
      gap="3"
    >
      <Switch.Label fontSize="13px" color="#3f3f46" fontWeight="600" lineClamp={1}>
        {label}
      </Switch.Label>
      <Switch.HiddenInput />
      <Switch.Control />
    </Switch.Root>
  );
}
