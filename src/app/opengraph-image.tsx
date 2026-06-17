import { ImageResponse } from "next/og";

export const alt =
  "Vatsal Maniar - Financial Engineering · Risk Systems · Quant";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          background: "#e8e8e4",
          color: "#16181d",
          padding: "72px",
          fontFamily: "Georgia, serif",
          backgroundImage:
            "linear-gradient(to right, rgba(22,24,29,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(22,24,29,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            letterSpacing: 2,
            color: "#767982",
            fontFamily: "monospace",
          }}
        >
          <span>VATSAL MANIAR</span>
          <span style={{ color: "#2440d8" }}>JERSEY CITY · NYC</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 600 }}>
            Financial Engineering.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 600,
              color: "#2440d8",
              fontStyle: "italic",
            }}
          >
            Risk Systems.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 30,
              color: "#43464d",
              maxWidth: 1000,
            }}
          >
            Treasury rates-risk attribution, FX options risk, portfolio
            analytics, and probabilistic event-market pricing.
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 23, color: "#767982" }}>
          M.S. Financial Engineering · Stevens - B.S. Computer Science · ASU
        </div>
      </div>
    ),
    { ...size },
  );
}
