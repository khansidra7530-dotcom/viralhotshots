import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/constants";

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #ff3d57 0%, #ff8a3d 50%, #c084fc 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 72, marginBottom: 16 }}>🔥</div>
        <div style={{ fontSize: 56, fontWeight: 800 }}>{SITE_NAME}</div>
        <div style={{ fontSize: 28, marginTop: 16, opacity: 0.95 }}>
          Trending news & expert guides daily
        </div>
      </div>
    ),
    { ...size }
  );
}
