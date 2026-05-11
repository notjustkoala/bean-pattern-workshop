"use client";

import { usePathname } from "next/navigation";
import { getPageTitle } from "@/lib/constants/routes";
import { MobileTabBar } from "./MobileTabBar";
import { TopBar } from "./TopBar";
import { WebSidebar } from "./WebSidebar";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <div className="min-h-screen">
      <WebSidebar />
      <div className="min-h-screen pb-28 lg:pl-72 lg:pb-0">
        <TopBar title={title} />
        <main className="mx-auto w-full max-w-[1480px] px-4 pb-8 md:px-6 lg:px-8">
          {children}
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
}
