import "@/styles/globals.css";

import { Header } from "@/components/header";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap", preload: true });

export const metadata: Metadata = {
  title: "dangtr.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <main className="flex flex-col w-full max-w-xl mx-auto px-8">
          <Header />

          {children}
        </main>
      </body>
    </html>
  );
}
