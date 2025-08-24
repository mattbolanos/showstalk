import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { SiteNav } from "@/components/site-nav";
import { HydrateClient } from "@/trpc/server";
import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "./theme-provider";
import { ReactScan } from "./react-scan-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "Showstalk",
  description: "Track concert ticket prices",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="overscroll-y-contain">
        <TRPCReactProvider>
          <HydrateClient>
            <ReactScan />
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <SiteNav />
              <main className="mx-auto w-full max-w-screen-xl px-3 pt-8 pb-12">
                {children}
              </main>
              <SpeedInsights />
            </ThemeProvider>
          </HydrateClient>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
