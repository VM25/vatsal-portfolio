import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, STIX_Two_Text } from "next/font/google";
import "./globals.css";

/*
  Weights are listed explicitly. The docs' "200 500" range string is rejected
  by this version's Google font validator (it checks each weight against the
  font's listed values), so the ranges are spelled out.
*/

// Display and UI: 200 for the name and titles, 300 for the lede, 400 for UI.
const geist = Geist({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
  variable: "--ff-geist",
  display: "swap",
});

// Only for numbers the page computes or counts.
const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--ff-geist-mono",
  display: "swap",
});

// Research prose and all mathematics.
const stix = STIX_Two_Text({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--ff-stix",
  display: "swap",
});

const description = "Financial engineer in Jersey City. Models for markets, risk and portfolios.";

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

export const viewport: Viewport = {
  themeColor: "#0B1214",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${stix.variable}`}>
      <body>{children}</body>
    </html>
  );
}
