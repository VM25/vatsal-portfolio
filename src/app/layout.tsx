import type { Metadata } from "next";
import { Syne, Chivo, Space_Mono } from "next/font/google";
import "./globals.css";
import { profile, links } from "@/data/profile";

// Display - architectural, high-conviction block type for the name + section titles.
const display = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

// Interface - a sharp, slightly industrial grotesque for body + UI.
const sans = Chivo({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-sans",
  display: "swap",
});

// Data - engineered monospace for tickers, metrics, key-rate labels, code.
const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

const description =
  "Vatsal Maniar - M.S. Financial Engineering at Stevens with a Computer Science foundation. Treasury rates-risk attribution, FX options risk, portfolio analytics, and probabilistic event-market pricing engines.";

export const metadata: Metadata = {
  metadataBase: new URL("https://vatsalmaniar.com"),
  title: {
    default: "Vatsal Maniar - Financial Engineering · Risk Systems · Quant",
    template: "%s · Vatsal Maniar",
  },
  description,
  keywords: [
    "Vatsal Maniar",
    "quant finance",
    "financial engineering",
    "rates risk",
    "DV01",
    "FX options risk",
    "Monte Carlo VaR",
    "portfolio analytics",
    "Stevens Institute of Technology",
  ],
  authors: [{ name: profile.name, url: links.linkedin }],
  creator: profile.name,
  openGraph: {
    type: "website",
    title: "Vatsal Maniar - Financial Engineering · Risk Systems · Quant",
    description,
    siteName: "Vatsal Maniar",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vatsal Maniar - Financial Engineering · Risk Systems · Quant",
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
      className={`${display.variable} ${sans.variable} ${mono.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
