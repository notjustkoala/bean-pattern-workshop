import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { APP_CONFIG } from "@/lib/constants/app-config";
import "./globals.css";

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} | ${APP_CONFIG.subtitle}`,
  description: APP_CONFIG.description
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
