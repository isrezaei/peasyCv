import { Box } from "@chakra-ui/react";
import YektanetAd from "@/components/ads/YektanetAd";

/** Master switch for every promotional/ad block in the app. Flip to `true` to
 *  bring the ad placements (inline slots + the ad modal) back. */
export const AD_BLOCKS_ENABLED = false;

interface AdvertisingUiProps {
  AdvertisingId: string;
  isShow: boolean;
  height?: number;
}

const AdvertisingUi = ({ AdvertisingId, isShow, height = 140 }: AdvertisingUiProps) => {
  // Promotional blocks are disabled app-wide: this single kill switch stops every
  // inline ad placement (the design-panel slots + the sidebar-panels slot) from
  // rendering, without touching any call site — the same "keep the code, hide the
  // output" approach used for the retired templates. Remove the early return to
  // re-enable ads.
  if (!AD_BLOCKS_ENABLED) return null;

  return (
    <Box
      display={!isShow ? "none" : "auto"}
      w={"full"}
      height={"auto"}
      p={2}
      minH={"8rem"}
      my={"1rem"}
      rounded={"lg"}
      overflow={"hidden"}
      border={"1px solid"}
      borderColor={"border.emphasized"}
    >
      <Box w={"full"} rounded={"sm"}>
        <YektanetAd adId={AdvertisingId} height={height} />
      </Box>
    </Box>
  );
};

export default AdvertisingUi;
