import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon — same mark, slightly more inset for iOS masking. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#3c3a39",
          color: "#ffffff",
          fontSize: 108,
          fontWeight: 800,
        }}
      >
        P<span style={{ color: "#2677ff" }}>.</span>
      </div>
    ),
    { ...size },
  );
}
