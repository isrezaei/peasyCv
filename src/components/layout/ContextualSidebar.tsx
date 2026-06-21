"use client";

import { Box, HStack, IconButton, VStack } from "@chakra-ui/react";
import { AdSidebar } from "@/components/ads/AdSidebar";
import { DesignPanel } from "@/components/panels/design/DesignPanel";
import { RearrangePanel } from "@/components/panels/rearrange/RearrangePanel";
import { TemplatesPanel } from "@/components/panels/templates/TemplatesPanel";
import { SidebarCollapseIcon, SidebarExpandIcon } from "@/components/ui/icons";
import { Tooltip } from "@/components/ui/Tooltip";
import { useActivePanel } from "@/hooks/store/useActivePanel";
import { useSidebar } from "@/hooks/store/useSidebar";
import { COLORS, RADII, SHADOWS } from "@/lib/design/tokens";
import { t } from "@/lib/i18n";
import AdvertisingUi from "@/components/ads/advertising.ui";

export function ContextualSidebar() {
  const { activePanel } = useActivePanel();
  const { collapsed, setCollapsed } = useSidebar();

  return (
    <Box
      className="no-print"
      flexShrink={0}
      height="100%"
      p="4"
      width={collapsed ? "64px" : "344px"}
      transition="width 0.22s ease"
      overflow="hidden"
    >
      {collapsed ? (
        <Tooltip label={t.sidebar.expand}>
          <IconButton
            aria-label={t.sidebar.expand}
            variant="solid"
            bg="white"
            color="fg.muted"
            boxShadow="rail"
            borderRadius="lg"
            size="sm"
            _hover={{ color: "accent.solid", boxShadow: "railHover" }}
            onClick={() => setCollapsed(false)}
          >
            <SidebarExpandIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <VStack
          as="aside"
          align="stretch"
          gap="0"
          height="100%"
          width="312px"
          bg="white"
          overflow="hidden"
          style={{ borderRadius: RADII.panel, boxShadow: SHADOWS.panel }}
        >
          {/* Panel top bar (44px) with a bottom hairline. */}
          <HStack
            height="44px"
            paddingInline="12px"
            justify="flex-end"
            flexShrink={0}
            style={{ boxShadow: SHADOWS.cardFaint }}
          >
            <Tooltip label={t.sidebar.collapse}>
              <IconButton
                aria-label={t.sidebar.collapse}
                variant="ghost"
                colorPalette="gray"
                width="30px"
                height="30px"
                minW="30px"
                fontSize="16px"
                color={COLORS.muted}
                style={{ borderRadius: RADII.control }}
                _hover={{ bg: COLORS.workspace, color: COLORS.ink600 }}
                onClick={() => setCollapsed(true)}
              >
                <SidebarCollapseIcon />
              </IconButton>
            </Tooltip>
          </HStack>

          {/* Scrollable panel content. */}
          <Box flex="1" overflowY="auto" className="om-scroll">
            <Box style={{ padding: "22px 22px 28px" }}>
              {activePanel === "design" ? <DesignPanel /> : null}
              {activePanel === "templates" ? <TemplatesPanel /> : null}
              {activePanel === "rearrange" ? <RearrangePanel /> : null}
              <Box mt="26px">
                <AdvertisingUi
                    isShow={true}
                    AdvertisingId={"pos-article-display-112303"}
                />
              </Box>
            </Box>
          </Box>
        </VStack>
      )}
    </Box>
  );
}
