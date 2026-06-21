"use client";

import { Badge, Box, Button, HStack, Menu, Portal, Text } from "@chakra-ui/react";
import { useState } from "react";
import { AdModal } from "@/components/ads/AdModal";
import {
  ChevronDownIcon,
  CheckTailorIcon,
  HomeIcon,
  LayoutIcon,
  PaletteIcon,
  RearrangeIcon,
  SparklesIcon,
  WandIcon,
} from "@/components/ui/icons";
import { useActivePanel } from "@/hooks/store/useActivePanel";
import { useSidebar } from "@/hooks/store/useSidebar";
import type { ActivePanel } from "@/store/types";
import { COLORS, RADII, SHADOWS } from "@/lib/design/tokens";
import { t } from "@/lib/i18n";
import { SaveStatusIndicator } from "./SaveStatusIndicator";
import { ToolButton } from "./ToolButton";

export function TopBar() {
  const { activePanel, setActivePanel } = useActivePanel();
  const { collapsed, setCollapsed } = useSidebar();
  const [adOpen, setAdOpen] = useState(false);

  // Clicking the active tool toggles the floating panel; clicking another tool
  // switches to it and makes sure the panel is open.
  const handleTool = (panel: ActivePanel) => {
    if (activePanel === panel) {
      setCollapsed(!collapsed);
    } else {
      setActivePanel(panel);
      setCollapsed(false);
    }
  };
  const isPanelActive = (panel: ActivePanel) => activePanel === panel && !collapsed;

  return (
    // Transparent strip so the workspace shows around the floating pill.
    <HStack as="header" className="no-print" justify="center" px="4" pt="4" pb="0">
      <HStack
        width="100%"
        maxW="1240px"
        height="56px"
        justify="space-between"
        gap="4"
        bg="white"
        paddingInlineStart="14px"
        paddingInlineEnd="12px"
        style={{ borderRadius: RADII.pill }}
      >
        {/* Right (logo + home + title) — first in RTL flow */}
        <HStack gap="3" flexShrink={0}>
          {/*<HStack gap="2">*/}
          {/*  <Box*/}
          {/*    width="34px"*/}
          {/*    height="34px"*/}
          {/*    borderRadius="md"*/}
          {/*    bg="accent.solid"*/}
          {/*    color="white"*/}
          {/*    display="flex"*/}
          {/*    alignItems="center"*/}
          {/*    justifyContent="center"*/}
          {/*    fontWeight="bold"*/}
          {/*    fontSize="14px"*/}
          {/*  >*/}
          {/*    ر*/}
          {/*  </Box>*/}
          {/*  <Menu.Root>*/}
          {/*    <Menu.Trigger asChild>*/}
          {/*      <Button size="xs" variant="ghost" gap="1" color={COLORS.ink600}>*/}
          {/*        <HomeIcon />*/}
          {/*        {t.app.home}*/}
          {/*        <ChevronDownIcon />*/}
          {/*      </Button>*/}
          {/*    </Menu.Trigger>*/}
          {/*    <Portal>*/}
          {/*      <Menu.Positioner>*/}
          {/*        <Menu.Content>*/}
          {/*          <Menu.Item value="resumes">{t.topbar.menuResumes}</Menu.Item>*/}
          {/*          <Menu.Item value="settings">{t.topbar.menuSettings}</Menu.Item>*/}
          {/*        </Menu.Content>*/}
          {/*      </Menu.Positioner>*/}
          {/*    </Portal>*/}
          {/*  </Menu.Root>*/}
          {/*</HStack>*/}
          {/*<Box height="22px" width="1px" style={{ background: COLORS.line08 }} />*/}
          {/*<Text fontWeight="600" fontSize="13px" style={{ color: COLORS.ink700 }}>*/}
          {/*  {t.app.newResume}*/}
          {/*</Text>*/}
          {/*<Badge colorPalette="gray" size="sm" variant="subtle">*/}
          {/*  {t.app.plan}*/}
          {/*</Badge>*/}
        </HStack>

        {/* Center tabs — design / templates / sections, then the AI tools. */}
        <HStack gap="3px" flex="1" justify="center">
          <ToolButton
            label={t.topbar.design}
            icon={<PaletteIcon />}
            active={isPanelActive("design")}
            onClick={() => handleTool("design")}
          />
          <ToolButton
            label={t.topbar.templates}
            icon={<LayoutIcon />}
            active={isPanelActive("templates")}
            onClick={() => handleTool("templates")}
          />
          <ToolButton
            label={t.topbar.rearrange}
            icon={<RearrangeIcon />}
            active={isPanelActive("rearrange")}
            onClick={() => handleTool("rearrange")}
          />
          <Box height="22px" width="1px" mx="1" style={{ background: COLORS.line08 }} />
          <ToolButton
            label={t.topbar.checkTailor}
            icon={<CheckTailorIcon />}
            onClick={() => setAdOpen(true)}
          />
          <ToolButton label={t.topbar.improveText} icon={<WandIcon />} onClick={() => setAdOpen(true)} />
          <ToolButton
            label={t.topbar.aiAssistant}
            icon={<SparklesIcon />}
            onClick={() => setAdOpen(true)}
          />
        </HStack>

        {/* Left (save status + upgrade + avatar) */}
        {/*<HStack gap="3" flexShrink={0}>*/}
        {/*  <SaveStatusIndicator />*/}
        {/*  <Button size="sm" colorPalette="accent" onClick={() => setAdOpen(true)}>*/}
        {/*    {t.app.upgrade}*/}
        {/*  </Button>*/}
        {/*  <Menu.Root>*/}
        {/*    <Menu.Trigger asChild>*/}
        {/*      <Box*/}
        {/*        as="button"*/}
        {/*        width="34px"*/}
        {/*        height="34px"*/}
        {/*        borderRadius="full"*/}
        {/*        display="flex"*/}
        {/*        alignItems="center"*/}
        {/*        justifyContent="center"*/}
        {/*        fontWeight="600"*/}
        {/*        fontSize="13px"*/}
        {/*        style={{ background: COLORS.workspace, color: COLORS.ink500, boxShadow: SHADOWS.avatarInset }}*/}
        {/*      >*/}
        {/*        ع*/}
        {/*      </Box>*/}
        {/*    </Menu.Trigger>*/}
        {/*    <Portal>*/}
        {/*      <Menu.Positioner>*/}
        {/*        <Menu.Content>*/}
        {/*          <Menu.Item value="profile">{t.topbar.menuProfile}</Menu.Item>*/}
        {/*          <Menu.Item value="settings">{t.topbar.menuSettings}</Menu.Item>*/}
        {/*          <Menu.Separator />*/}
        {/*          <Menu.Item value="logout">{t.topbar.menuLogout}</Menu.Item>*/}
        {/*        </Menu.Content>*/}
        {/*      </Menu.Positioner>*/}
        {/*    </Portal>*/}
        {/*  </Menu.Root>*/}
        {/*</HStack>*/}
      </HStack>

      <AdModal open={adOpen} onClose={() => setAdOpen(false)} />
    </HStack>
  );
}
