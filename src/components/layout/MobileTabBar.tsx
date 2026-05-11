"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Folder, Home, LayoutGrid, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MOBILE_TAB_ITEMS, type NavItem, type NavItemId } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

const ICONS: Partial<Record<NavItemId, LucideIcon>> = {
  home: Home,
  projects: Folder,
  templates: LayoutGrid,
  profile: User
};

function isActiveItem(pathname: string, item: NavItem) {
  if (item.id === "home") return pathname === "/";
  if (item.id === "projects") return pathname.startsWith("/projects");
  return false;
}

function MobileTab({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const active = isActiveItem(pathname, item);
  const Icon = ICONS[item.id] ?? Home;

  const content = (
    <>
      <Icon className="h-6 w-6" />
      <span className="text-xs font-bold">{item.label}</span>
      {active ? <span className="absolute bottom-1 h-1 w-8 rounded-full bg-milk-purple" /> : null}
    </>
  );

  const className = cn(
    "relative flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 transition",
    active ? "text-milk-purple" : "text-bean-muted",
    item.disabled && "opacity-70"
  );

  if (item.disabled) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link href={item.href} className={className}>
      {content}
    </Link>
  );
}

export function MobileTabBar() {
  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 flex h-[74px] items-center rounded-4xl border border-bean-border bg-white/90 px-3 shadow-soft backdrop-blur-xl lg:hidden">
      {MOBILE_TAB_ITEMS.map((item) => (
        <MobileTab key={item.id} item={item} />
      ))}
    </nav>
  );
}
