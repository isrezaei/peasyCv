"use client";

import { chakra, Popover, Portal, Separator, Stack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { type ReactNode, useState } from "react";
import { TbDeviceDesktop, TbMoon, TbSun } from "react-icons/tb";
import { AdModal } from "@/components/ads/AdModal";
import { pickAdModalId } from "@/components/ads/adIds";
import { ShareDialog } from "@/components/layout/ShareDialog";
import {
  CheckTailorIcon,
  DotsIcon,
  EyeIcon,
  LayoutIcon,
  PaletteIcon,
  RearrangeIcon,
  ShareIcon,
  SparklesIcon,
  WandIcon,
} from "@/components/ui/icons";
import { Tooltip } from "@/components/ui/Tooltip";
import { useActivePanel } from "@/hooks/store/useActivePanel";
import { useSidebar } from "@/hooks/store/useSidebar";
import { useAuth } from "@/lib/auth/AuthProvider";
import { DOCK, DOCK_RADII, DOCK_SHADOWS } from "@/lib/design/tokens";
import { t } from "@/lib/i18n";
import type { ActivePanel } from "@/store/types";

function MenuRow({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <chakra.button
      type="button"
      onClick={onClick}
      display="flex"
      alignItems="center"
      gap="10px"
      width="100%"
      px="10px"
      py="9px"
      fontSize="sm"
      color="fg"
      bg="transparent"
      cursor="pointer"
      borderRadius="md"
      transition="background .12s"
      _hover={{ bg: "bg.muted" }}
    >
      {icon}
      {label}
    </chakra.button>
  );
}

const THEME_MODES = ["light", "dark", "system"] as const;

/**
 * Compact top-bar overflow menu shown BELOW `lg`, where the full floating tool
 * dock is hidden. Every dock action stays reachable from here: the three panels
 * (which also open the drawer), Preview, Share, the AI actions, and the color-mode
 * cycle — so nothing is lost on a phone or small tablet. Auth-gated actions route a
 * guest to /login exactly like the desktop dock does.
 */
export function MobileToolMenu() {
  const [open, setOpen] = useState(false);
  const [adOpen, setAdOpen] = useState(false);
  const [adId, setAdId] = useState(() => pickAdModalId());
  const [shareOpen, setShareOpen] = useState(false);
  const { setActivePanel } = useActivePanel();
  const { setCollapsed } = useSidebar();
  const { status } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const openPanel = (panel: ActivePanel) => {
    setActivePanel(panel);
    setCollapsed(false);
    setOpen(false);
  };

  // Preview shows an ad modal; sharing and the AI actions need an account, so a
  // guest is sent to the login sheet (the same gate the desktop dock uses).
  const openPreview = () => {
    setAdId(pickAdModalId());
    setAdOpen(true);
    setOpen(false);
  };
  const openShare = () => {
    setOpen(false);
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }
    setShareOpen(true);
  };
  const openAi = () => {
    setOpen(false);
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }
    setAdId(pickAdModalId());
    setAdOpen(true);
  };

  const mode = (THEME_MODES as readonly string[]).includes(theme ?? "") ? theme : "system";
  const nextTheme = THEME_MODES[(THEME_MODES.indexOf(mode as (typeof THEME_MODES)[number]) + 1) % THEME_MODES.length];
  const themeLabel =
    mode === "light" ? t.topbar.colorModeLight : mode === "dark" ? t.topbar.colorModeDark : t.topbar.colorModeSystem;
  const ThemeIcon = mode === "light" ? TbSun : mode === "dark" ? TbMoon : TbDeviceDesktop;

  return (
    <Popover.Root
      open={open}
      onOpenChange={(details) => setOpen(details.open)}
      positioning={{ placement: "bottom-end" }}
      lazyMount
      unmountOnExit
    >
      <Tooltip label={t.topbar.more}>
        <Popover.Trigger asChild>
          <chakra.button
            type="button"
            aria-label={t.topbar.more}
            className="no-print"
            width="44px"
            height="44px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            cursor="pointer"
            color={DOCK.idleFg}
            bg={DOCK.glassBg}
            transition="background .15s, color .15s"
            _hover={{ bg: DOCK.glassSolid, color: DOCK.hoverFg }}
            style={{
              borderRadius: DOCK_RADII.toggle,
              border: `1px solid ${DOCK.borderStrong}`,
              backdropFilter: DOCK.blur,
              WebkitBackdropFilter: DOCK.blur,
              boxShadow: DOCK_SHADOWS.side,
            }}
          >
            <DotsIcon size={20} />
          </chakra.button>
        </Popover.Trigger>
      </Tooltip>
      <Portal>
        <Popover.Positioner>
          <Popover.Content
            width="228px"
            borderRadius="xl"
            bg="bg.panel"
            borderWidth="1px"
            borderColor="border"
            boxShadow="lg"
            overflow="hidden"
            className="no-print"
          >
            <Popover.Body p="6px">
              <Stack gap="1px">
                <MenuRow icon={<PaletteIcon />} label={t.topbar.design} onClick={() => openPanel("design")} />
                <MenuRow icon={<LayoutIcon />} label={t.topbar.templates} onClick={() => openPanel("templates")} />
                <MenuRow icon={<RearrangeIcon />} label={t.topbar.rearrange} onClick={() => openPanel("rearrange")} />
                <Separator my="1" />
                <MenuRow icon={<EyeIcon />} label={t.topbar.preview} onClick={openPreview} />
                <MenuRow icon={<ShareIcon />} label={t.topbar.share} onClick={openShare} />
                <Separator my="1" />
                <MenuRow icon={<CheckTailorIcon />} label={t.topbar.checkTailor} onClick={openAi} />
                <MenuRow icon={<WandIcon />} label={t.topbar.improveText} onClick={openAi} />
                <MenuRow icon={<SparklesIcon />} label={t.topbar.aiAssistant} onClick={openAi} />
                <Separator my="1" />
                <MenuRow icon={<ThemeIcon />} label={themeLabel} onClick={() => setTheme(nextTheme)} />
              </Stack>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>

      <AdModal open={adOpen} adId={adId} onClose={() => setAdOpen(false)} />
      <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} />
    </Popover.Root>
  );
}
