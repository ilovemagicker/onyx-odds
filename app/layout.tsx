import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Odds · Onyx Labs",
  description:
    "通用 N 選項機率統計工具。依歷史結果顯示頻率與該出參考——統計參考／非預測保證。",
  applicationName: "Onyx Odds",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
