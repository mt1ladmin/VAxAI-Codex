import { ImageResponse } from "next/og";

export const alt = "VAxAI — Reduce admin. Keep people in the loop.";
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
          justifyContent: "center",
          padding: "72px 80px",
          background: "#122428",
          color: "#ffffff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "#D8FC2E",
              color: "#122428",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 800,
            }}
          >
            VA
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>
            VAxAI
          </div>
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 650,
            lineHeight: 1.12,
            letterSpacing: "-0.03em",
            maxWidth: 900,
          }}
        >
          Reduce admin. Keep people in the loop.
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 24,
            lineHeight: 1.45,
            color: "rgba(255,255,255,0.72)",
            maxWidth: 860,
          }}
        >
          Clear backlogs, strengthen admin foundations, and prepare for AI and
          automation with experienced people in the loop.
        </div>
      </div>
    ),
    { ...size },
  );
}
