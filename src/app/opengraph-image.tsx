import { ImageResponse } from "next/og";

export const alt = "Vatsal Maniar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ONYX = "#020202";
const PRAXETI = "#f6f7ed";
const SAFFRON = "#ff9932";
const AQUA = "#a0c9cb";

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
          background: ONYX,
          color: PRAXETI,
          padding: "68px 72px",
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 20, color: AQUA, letterSpacing: 3 }}>
          JERSEY CITY, NEW JERSEY
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 150,
              fontWeight: 800,
              letterSpacing: -7,
              lineHeight: 0.88,
            }}
          >
            Vatsal
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 150,
              fontWeight: 800,
              letterSpacing: -7,
              lineHeight: 0.88,
            }}
          >
            Maniar
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", height: 1, width: "100%", background: "#114c5a" }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 22,
              fontSize: 24,
              color: AQUA,
            }}
          >
            <span>Measuring what risk actually costs</span>
            <span style={{ color: SAFFRON }}>Graduating December 2026</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
