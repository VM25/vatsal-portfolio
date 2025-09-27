// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetmono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Vatsal Maniar | Quant Finance",
  description:
    "Portfolio of Vatsal Maniar — Quantitative Finance & Engineering.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetmono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}