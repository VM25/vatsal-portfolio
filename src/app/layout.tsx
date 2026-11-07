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

/*
  Preview builds only: `CLEARING_NOINDEX=1` at build time marks every page noindex.
  Production never sets it, so the live site keeps index, follow.
*/
const noindex = process.env.CLEARING_NOINDEX === "1";

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
  robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0B1214",
  colorScheme: "dark",
  viewportFit: "cover",
};

/*
  Runs while the HTML is parsed, before the first paint (see the Next guide
  "preventing flash before hydration"). It marks <html> with .js, so the rail's
  tabs and the claims' accordion show collapsed from the first frame, and with
  .rm under reduced motion, so the Sharpe bars never start at zero for those
  readers. Without JavaScript neither class is set and everything is expanded.
  ScrollState keeps .rm in sync afterwards; suppressHydrationWarning lets React
  accept the classes it did not render. If the app has not hydrated (ScrollState
  sets data-hydrated) within five seconds, the bundle is taken to have failed and
  .js comes off, so the page falls back to its fully expanded form.
*/
const BOOT = `(function(){var d=document.documentElement;d.classList.add("js");try{if(matchMedia("(prefers-reduced-motion: reduce)").matches)d.classList.add("rm")}catch(e){}setTimeout(function(){if(!d.hasAttribute("data-hydrated"))d.classList.remove("js")},5000)})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${stix.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
