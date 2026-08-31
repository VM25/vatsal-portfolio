import type { Metadata } from "next";
import { Instrument_Serif, Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { profile, links } from "@/data/profile";

// Display — a high-contrast editorial serif. Static 400 with a true italic;
// at masthead sizes it needs no other weight, and the italic is the only
// emphasis it ever takes.
const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

// Text — a variable grotesque, so the 550 and 650 weights the subheads use are
// real instances rather than synthesised.
const sans = Archivo({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Data — every figure, ticker, DV01, and plate number on the page. Two weights
// only: a third static instance is another font file on the critical path for a
// difference nobody can see at 11px.
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-mono",
  display: "swap",
});

const description =
  "Vatsal Maniar — M.S. Financial Engineering at Stevens with a Computer Science foundation. Seven systems across Treasury rates attribution, FX options risk, credit decisioning, multi-asset allocation, systematic signal research, and C++ derivatives numerics.";

export const metadata: Metadata = {
  metadataBase: new URL("https://maniar-portfolio.netlify.app"),
  title: {
    default: "Vatsal Maniar — Risk Systems, Derivatives Numerics, Quant Research",
    template: "%s · Vatsal Maniar",
  },
  description,
  keywords: [
    "Vatsal Maniar",
    "quant finance",
    "financial engineering",
    "rates risk attribution",
    "DV01",
    "FX options risk",
    "Monte Carlo VaR",
    "systematic alpha research",
    "derivatives numerics",
    "credit risk decisioning",
    "Stevens Institute of Technology",
  ],
  authors: [{ name: profile.name, url: links.linkedin }],
  creator: profile.name,
  openGraph: {
    type: "website",
    title: "Vatsal Maniar — Risk Systems, Derivatives Numerics, Quant Research",
    description,
    siteName: "Vatsal Maniar",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vatsal Maniar — Risk Systems, Derivatives Numerics, Quant Research",
    description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body>
        {/*
          Without JavaScript the reveal observer never runs, and every
          `data-reveal` element would stay at opacity 0 — a blank page. This
          hands the whole record to anyone who arrives with scripting off.
        */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;clip-path:none!important}.plate__svg [data-draw]{stroke-dashoffset:0!important}.plate__svg [data-grow]{transform:none!important}.plate__svg [data-pop]{opacity:1!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
