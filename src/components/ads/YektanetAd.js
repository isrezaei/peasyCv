"use client";

import React, { useEffect, useRef } from "react";
import { Stack, Text } from "@chakra-ui/react";

export default function YektanetAd({ adId, height = 250 }) {
  const iframeRef = useRef(null);
  useEffect(() => {
    if (!adId) return;

    // وقتی مسیر عوض شد یا id تغییر کرد، iframe مجدد لود می‌شود
    const iframe = iframeRef.current;
    iframe.src = `/yektanet-ad.html?id=${encodeURIComponent(adId)}`;
  }, [adId]);

  return (
    <>
      <Stack>
        {/*<Text textAlign={"center"} fontSize={"smaller"}>*/}
        {/*  با فقط یک کلیک روی تبلیغات از ما حمایت کنید🌸🙏*/}
        {/*</Text>*/}
        <iframe
          ref={iframeRef}
          title={`yektanet-${adId}`}
          style={{
            width: "100%",
            height: `${height}px`,
            border: "none",
            // background: "transparent", // ✅ حذف رنگ پشت iframe
            background: "black",
            overflow: "hidden",
            padding: 0,
            transform: "scale(1)",
            borderRadius: "10px",
          }}
        />
      </Stack>
    </>
  );
}
