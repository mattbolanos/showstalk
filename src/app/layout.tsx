import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { SiteNav } from "@/components/site-nav";
import { HydrateClient } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Showstalk",
  description: "Track concert ticket prices",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <head>
        <script
          async
          crossOrigin="anonymous"
          src="//unpkg.com/react-scan/dist/auto.global.js"
        />
      </head>
      <body>
        <TRPCReactProvider>
          <SiteNav />
          <HydrateClient>
            <main className="mx-auto w-full max-w-[var(--breakpoint-2xl)] px-3 py-8">
              {children}
            </main>
          </HydrateClient>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
