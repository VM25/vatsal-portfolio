import { ImageResponse } from "next/og";

export const alt =
  "Vatsal Maniar — Quant Finance · Derivatives Risk · Trading Systems";
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
          background: "#0c0a09",
          color: "#ece3d6",
          padding: "72px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            letterSpacing: 2,
            color: "#7c7060",
          }}
        >
          <span>VATSAL MANIAR</span>
          <span style={{ color: "#e8a23d" }}>JERSEY CITY · NYC</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 600 }}>
            Quant Finance.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 92,
              fontWeight: 600,
              color: "#e8a23d",
            }}
          >
            Derivatives Risk.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 30,
              color: "#b3a795",
              maxWidth: 980,
            }}
          >
            Probabilistic pricing engines, market-making &amp; risk systems, and
            portfolio analytics.
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 23, color: "#7c7060" }}>
          M.S. Financial Engineering · Stevens — B.S. Computer Science · ASU
        </div>
      </div>
    ),
    { ...size },
  );
}
