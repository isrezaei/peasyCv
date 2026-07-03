import { Center, Text } from "@chakra-ui/react";
import { AD_HATCH, COLORS, RADII, SHADOWS } from "@/lib/design/tokens";
import { t } from "@/lib/i18n";

export function AdSidebar() {
  return (
    <Center
      className="no-print"
      height="148px"
      style={{ borderRadius: RADII.card, background: AD_HATCH, boxShadow: SHADOWS.cardFaint }}
    >
      <Text fontSize="12px" fontFamily="monospace" style={{ color: COLORS.faint }}>
        {t.ads.sidebar}
      </Text>
    </Center>
  );
}
