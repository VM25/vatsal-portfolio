import type { Metadata } from "next";
import { Big_Shoulders, B612, B612_Mono } from "next/font/google";
import "./globals.css";

// Chapter titles and the name. Extremely condensed and very tall — at
// full-screen sizes it reads as architecture rather than as text.
const display = Big_Shoulders({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

// Reading text. Drawn by Airbus for cockpit displays, so it was designed to
// stay legible on a lit surface that is moving — which is this whole page.
const body = B612({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

// Readouts, coordinates, figures.
const mono = B612_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

const description =
  "Vatsal Maniar builds systems that measure risk — across interest rates, currencies, credit and portfolios.";

export const metadata: Metadata = {
  metadataBase: new URL("https://maniar-portfolio.netlify.app"),
  title: { default: "Vatsal Maniar", template: "%s · Vatsal Maniar" },
  description,
  keywords: [
    "Vatsal Maniar",
    "quantitative finance",
    "financial engineering",
    "risk",
    "derivatives",
    "Stevens Institute of Technology",
  ],
  openGraph: {
    type: "website",
    title: "Vatsal Maniar",
    description,
    siteName: "Vatsal Maniar",
  },
  twitter: { card: "summary_large_image", title: "Vatsal Maniar", description },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
