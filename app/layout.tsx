import type { Metadata } from "next";
import ThemeToggle from "./components/theme-toggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Emby 求片站",
  description: "提交想看的电影或电视剧给管理员"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-theme="dark" lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
