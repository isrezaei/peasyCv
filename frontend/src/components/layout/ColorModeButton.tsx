"use client";

import { chakra } from "@chakra-ui/react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { TbDeviceDesktop, TbMoon, TbSun } from "react-icons/tb";
import { Tooltip } from "@/components/ui/Tooltip";
import { DOCK, DOCK_RADII } from "@/lib/design/tokens";
import { t } from "@/lib/i18n";

const MODES = ["light", "dark", "system"] as const;
type Mode = (typeof MODES)[number];

const MODE_LABEL: Record<Mode, string> = {
  light: t.topbar.colorModeLight,
  dark: t.topbar.colorModeDark,
  system: t.topbar.colorModeSystem,
};

/**
 * Dark / light / system cycle button for the dock's end cluster, styled like its
 * 38px neighbours (save status, avatar). The choice is an APP preference —
 * next-themes persists it in localStorage ("theme"), completely outside the
 * résumé document/DB. Until mounted, next-themes can't know the stored choice,
 * so a neutral system glyph renders first to avoid a hydration mismatch.
 */
const emptySubscribe = () => () => {};

export function ColorModeButton() {
  const { theme, setTheme } = useTheme();
  // True only after hydration (server snapshot false, client snapshot true).
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const mode: Mode =
    mounted && (MODES as readonly string[]).includes(theme ?? "")
      ? (theme as Mode)
      : "system";
  const next = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
  const label = MODE_LABEL[mode];

  return (
    <Tooltip label={label}>
      <chakra.button
        type="button"
        aria-label={label}
        onClick={() => setTheme(next)}
        display="flex"
        alignItems="center"
        justifyContent="center"
        width="38px"
        height="38px"
        cursor="pointer"
        color={DOCK.idleFg}
        bg="transparent"
        transition="background .15s, color .15s"
        _hover={{ bg: DOCK.hoverBg, color: DOCK.hoverFg }}
        style={{ borderRadius: DOCK_RADII.saveBtn }}
      >
        {mode === "light" ? (
          <TbSun size={20} />
        ) : mode === "dark" ? (
          <TbMoon size={20} />
        ) : (
          <TbDeviceDesktop size={20} />
        )}
      </chakra.button>
    </Tooltip>
  );
}
