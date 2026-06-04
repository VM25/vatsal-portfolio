import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { profile, links } from "@/data/profile";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

const description =
  "Vatsal Maniar — M.S. Financial Engineering at Stevens with a CS foundation. Building probabilistic pricing engines, derivatives risk and market-making systems, and portfolio analytics.";

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
    "quant research",
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
