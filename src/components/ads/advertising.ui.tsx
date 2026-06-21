import React from "react";
import { Box } from "@chakra-ui/react";
import { nanoid } from "nanoid";
import YektanetAd from "@/components/ads/YektanetAd";


const AdvertisingUi = ({ AdvertisingId, isShow, height = 140 }) => {
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
