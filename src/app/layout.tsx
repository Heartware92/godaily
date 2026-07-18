import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Godaily",
  description: "나만의 일기",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fafaf9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} antialiased`}>
      <body className="min-h-screen bg-background">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
