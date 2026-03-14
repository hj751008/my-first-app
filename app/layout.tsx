import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "수지의 수학 학습 도우미",
  description: "중1 수학 기초를 OpenAI 기반 대화형 튜터로 다시 익히는 학습 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
