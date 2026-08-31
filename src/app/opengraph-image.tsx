import { ImageResponse } from "next/og";

// The card carries the same four colours and the same claim as the masthead —
// paper, navy ink, petrol rule, and orange on the one phrase that matters.
export const alt =
  "Vatsal Maniar — Risk Systems, Derivatives Numerics, Quant Research";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#f9f9f9";
const INK = "#092363";
const RULE = "#004e72";
const SIGNAL = "#ff6342";

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
          background: PAPER,
          color: INK,
          padding: "64px 72px",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* masthead rule */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 21,
              letterSpacing: 3,
              color: RULE,
              fontFamily: "monospace",
              textTransform: "uppercase",
            }}
          >
            <span>Vatsal Maniar — working record</span>
            <span>7 systems · 1 memo</span>
          </div>
          <div
            style={{
              display: "flex",
              height: 2,
              width: "100%",
              background: INK,
              marginTop: 14,
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 82, lineHeight: 1.02 }}>
            Risk systems that turn uncertainty
          </div>
          <div style={{ display: "flex", fontSize: 82, lineHeight: 1.02 }}>
            into something you can
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 82,
              lineHeight: 1.02,
              fontStyle: "italic",
              color: SIGNAL,
            }}
          >
            price, hedge, and explain.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              height: 1,
              width: "100%",
              background: RULE,
              opacity: 0.45,
              marginBottom: 18,
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 22,
              color: RULE,
              fontFamily: "monospace",
            }}
          >
            <span>Rates · FX · Credit · Allocation · Derivatives numerics</span>
            <span>M.S. Financial Engineering, Stevens</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
