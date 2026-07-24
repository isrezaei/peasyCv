"use client";

import { Box } from "@chakra-ui/react";
import AdvertisingUi from "@/components/ads/advertising.ui";
import { DesignPanel } from "@/components/panels/design/DesignPanel";
import { RearrangePanel } from "@/components/panels/rearrange/RearrangePanel";
import { TemplatesPanel } from "@/components/panels/templates/TemplatesPanel";
import { useActivePanel } from "@/hooks/store/useActivePanel";

/**
 * The contextual panel CONTENT, shared by both presentations of the sidebar: the
 * inline overlay panel (wide screens) and the Drawer modal (md and below). It
 * renders whichever panel the topbar selected plus the trailing sidebar ad, so the
 * two shells stay pixel-identical and there is a single source of truth.
 */
export function SidebarPanels() {
  const { activePanel } = useActivePanel();

  return (
    <Box data-testid="sidebar-panels" style={{ padding: "22px 22px 28px" }}>
      {activePanel === "design" ? <DesignPanel /> : null}
      {activePanel === "templates" ? <TemplatesPanel /> : null}
      {activePanel === "rearrange" ? <RearrangePanel /> : null}
      <Box mt="26px">
        <AdvertisingUi isShow={true} AdvertisingId={"pos-article-display-111915"} />
      </Box>
    </Box>
  );
}
