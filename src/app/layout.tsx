import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { profile, links } from "@/data/profile";

// Everything structural — name, headings, body, buttons.
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Labels, figures, years. Anything that should line up in a column.
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

// Reserved for the single pull quote. It appears once on the page.
const quote = Fraunces({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400"],
  variable: "--font-quote",
  display: "swap",
});

const description =
  "Vatsal Maniar builds systems that measure risk — across interest rates, currencies, credit, and portfolios. Master's in Financial Engineering at Stevens, with a computer science degree behind it.";

export const metadata: Metadata = {
  metadataBase: new URL("https://maniar-portfolio.netlify.app"),
  title: {
    default: "Vatsal Maniar",
    template: "%s · Vatsal Maniar",
  },
  description,
  keywords: [
    "Vatsal Maniar",
    "quantitative finance",
    "financial engineering",
    "risk",
    "derivatives",
    "interest rates",
    "portfolio analysis",
    "Stevens Institute of Technology",
  ],
  authors: [{ name: profile.name, url: links.linkedin }],
  creator: profile.name,
  openGraph: {
    type: "website",
    title: "Vatsal Maniar",
    description,
    siteName: "Vatsal Maniar",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vatsal Maniar",
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
      className={`${sans.variable} ${mono.variable} ${quote.variable}`}
    >
      <body>
        {/* Without scripting the reveal observer never runs. Show everything. */}
        <noscript>
          <style>{`[data-r]{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
