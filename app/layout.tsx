import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AlmostBurnOut - 나는 자주, 나로 돌아온다",
  description: "번아웃 직전 단계를 진단하고 자기다움을 회복하는 여정. 2분 진단으로 당신의 번아웃 위험도를 확인하세요.",
  keywords: "번아웃, 번아웃 진단, 번아웃 테스트, 완벽주의, 워라밸, 스트레스 관리",
  authors: [{ name: "BeOrigin" }],
  openGraph: {
    title: "AlmostBurnOut - 나는 자주, 나로 돌아온다",
    description: "번아웃 직전 단계를 진단하고 자기다움을 회복하는 여정",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
