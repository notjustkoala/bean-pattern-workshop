"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleHelp,
  Folder,
  Heart,
  Home,
  Image,
  LayoutGrid,
  Package,
  Settings,
  User
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  WEB_NAV_ITEMS,
  WEB_SECONDARY_NAV_ITEMS,
  type NavItem,
  type NavItemId
} from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import { Logo } from "@/components/shared/Logo";
import { BeadMascot } from "@/components/shared/BeadMascot";

const ICONS: Record<NavItemId, LucideIcon> = {
  home: Home,
  workspace: Image,
  projects: Folder,
  templates: LayoutGrid,
  materials: Package,
  favorites: Heart,
  profile: User,
  settings: Settings,
  help: CircleHelp
};

function isActiveItem(pathname: string, item: NavItem) {
  if (item.id === "home") return pathname === "/";
  if (item.id === "workspace") return pathname.startsWith("/workspace");
  if (item.id === "projects") return pathname.startsWith("/projects");
  return false;
}

function SidebarItem({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const active = isActiveItem(pathname, item);
  const Icon = ICONS[item.id];

  const content = (
    <>
      <Icon className="h-5 w-5 shrink-0" />
      <span className="truncate">{item.label}</span>
    </>
  );

  const className = cn(
    "flex h-12 items-center gap-3 rounded-2xl px-4 text-sm font-bold transition",
    active
      ? "bg-milk-purple-soft text-milk-purple shadow-insetSoft"
      : "text-bean-ink/80 hover:bg-white hover:text-milk-purple",
    item.disabled && "cursor-default opacity-70 hover:bg-transparent hover:text-bean-ink/80"
  );

  if (item.disabled) {
    return (
      <div className={className} aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <Link href={item.href} className={className}>
      {content}
    </Link>
  );
}

export function WebSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-bean-border/80 bg-white/70 px-5 py-7 shadow-[12px_0_40px_rgba(124,58,237,0.06)] backdrop-blur-2xl lg:flex lg:flex-col">
      <Logo />

      <nav className="mt-8 space-y-2">
        {WEB_NAV_ITEMS.map((item) => (
          <SidebarItem key={item.id} item={item} />
        ))}
      </nav>

      <div className="my-6 h-px bg-bean-border/80" />

      <nav className="space-y-2">
        {WEB_SECONDARY_NAV_ITEMS.map((item) => (
          <SidebarItem key={item.id} item={item} />
        ))}
      </nav>

      <div className="mt-auto overflow-hidden rounded-3xl border border-bean-border bg-gradient-to-br from-white via-milk-purple-soft/50 to-white p-4 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-amber-100 p-2 text-xl">♛</div>
          <div>
            <p className="text-sm font-black text-bean-ink">豆图工坊 Pro</p>
            <p className="mt-1 text-xs leading-5 text-bean-muted">解锁高清导出、批量生成与更多高级能力</p>
          </div>
        </div>
        <button className="mt-4 h-11 w-full rounded-2xl bg-purple-button text-sm font-black text-white shadow-bead">
          立即升级
        </button>
        <div className="mt-4 flex justify-center">
          <BeadMascot size="md" withBoard />
        </div>
      </div>
    </aside>
  );
}
