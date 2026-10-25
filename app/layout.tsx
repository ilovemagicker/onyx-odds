import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://odds.onyxlab.dev";
const description =
  "通用 N 選項歷史統計工具（Onyx Labs）。依紀錄顯示頻率與該出參考——統計工具／非保證預測，不影響真實下一局機率。";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Odds · Onyx Labs",
  description,
  applicationName: "Onyx Odds",
  openGraph: {
    title: "Odds · Onyx Labs",
    description,
    url: siteUrl,
    siteName: "Onyx Labs",
    locale: "zh_HK",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Odds · Onyx Labs",
    description,
  },
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
