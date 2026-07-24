import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/** App icon — warm-black tile, white "P", brand-blue dot. Latin mark. */
export default function Icon() {
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
          fontSize: 320,
          fontWeight: 800,
          borderRadius: 96,
        }}
      >
        P<span style={{ color: "#2677ff" }}>.</span>
      </div>
    ),
    { ...size },
  );
}
