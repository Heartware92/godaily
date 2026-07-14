import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
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
  maximumScale: 1,
  userScalable: false,
  themeColor: "#fafaf9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="h-full">
        {/* 모든 페이지 상단에 떠 있는 홈 링크 (페이지 헤더의 pt-12 여백 영역에 위치) */}
        <Link
          href="/"
          className="fixed left-1/2 top-0 z-50 -translate-x-1/2 px-6 pb-2 pt-3 text-[15px] font-extrabold tracking-tight text-foreground active:opacity-60"
        >
          Godaily
        </Link>
        {children}
      </body>
    </html>
  );
}
