import type { Metadata } from "next";
import { DM_Sans, Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { SolanaProvider } from "../lib/solana/wallet";
import { BalanceProvider } from "../context/BalContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tipping",
  description: "Tipping is platform to contribute to world and grow the world",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}  antialiased bg-zinc-50`}
      >
        <SolanaProvider>
          <BalanceProvider>{children}</BalanceProvider>
        </SolanaProvider>
      </body>
    </html>
  );
}
