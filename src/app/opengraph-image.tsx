import { ImageResponse } from "next/og";

export const alt = "Vatsal Maniar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The Clearing palette: harbor night, pearl fog and one sodium lamp.
const NIGHT = "#0B1214";
const NIGHT_DEEP = "#060A0B";
const FOG_HI = "#E6EBE7";
const FOG_MID = "#9AA39E";
const FOG_LO = "#5B6661";
const SODIUM = "#FFA62B";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: `linear-gradient(180deg, ${NIGHT_DEEP} 0%, ${NIGHT} 70%, ${NIGHT_DEEP} 100%)`,
          color: FOG_HI,
          padding: "68px 72px",
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex" }} />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 132,
              fontWeight: 300,
              letterSpacing: -5,
              lineHeight: 1,
            }}
          >
            Vatsal Maniar
          </div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 34, color: FOG_HI, opacity: 0.86 }}>
            Financial Engineering · Quantitative Research
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", height: 1, width: "100%", background: FOG_LO }} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 24,
              fontSize: 26,
              color: FOG_MID,
            }}
          >
            <div
              style={{
                display: "flex",
                width: 14,
                height: 14,
                borderRadius: 7,
                background: SODIUM,
                boxShadow: `0 0 18px ${SODIUM}`,
                marginRight: 16,
              }}
            />
            Graduating December 2026 · open to full-time quantitative roles
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
