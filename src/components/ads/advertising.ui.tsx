import { Box } from "@chakra-ui/react";
import YektanetAd from "@/components/ads/YektanetAd";

interface AdvertisingUiProps {
  AdvertisingId: string;
  isShow: boolean;
  height?: number;
}

const AdvertisingUi = ({ AdvertisingId, isShow, height = 140 }: AdvertisingUiProps) => {
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
      border={"3px dotted"}
      borderColor={"yellow.emphasized"}
    >
      <Box w={"full"} rounded={"sm"}>
        <YektanetAd adId={AdvertisingId} height={height} />
      </Box>
    </Box>
  );
};

export default AdvertisingUi;
