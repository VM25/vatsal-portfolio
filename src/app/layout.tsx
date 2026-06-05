import type { Metadata } from "next";
import { Spectral, Schibsted_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { profile, links } from "@/data/profile";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";

// The dossier voice — institutional serif for large scene titles.
const display = Spectral({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-spectral",
  display: "swap",
});

// The institutional voice — clean grotesque for body + UI (variable).
const sans = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted",
  display: "swap",
});

// The terminal voice — technical mono for data, tickers, labels (variable).
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const description =
  "Vatsal Maniar — M.S. Financial Engineering at Stevens with a Computer Science foundation. Probabilistic pricing engines, derivatives risk and market-making systems, and portfolio analytics.";

export const metadata: Metadata = {
  metadataBase: new URL("https://vatsalmaniar.com"),
  title: {
    default: "Vatsal Maniar — Quant Finance · Derivatives Risk · Trading Systems",
    template: "%s · Vatsal Maniar",
  },
  description,
  keywords: [
    "Vatsal Maniar",
    "quant finance",
    "financial engineering",
    "derivatives risk",
    "market making",
    "portfolio optimization",
    "Monte Carlo VaR",
    "Stevens Institute of Technology",
  ],
  authors: [{ name: profile.name, url: links.linkedin }],
  creator: profile.name,
  openGraph: {
    type: "website",
    title: "Vatsal Maniar — Quant Finance · Derivatives Risk · Trading Systems",
    description,
    siteName: "Vatsal Maniar",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vatsal Maniar — Quant Finance · Derivatives Risk · Trading Systems",
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
      <body>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
