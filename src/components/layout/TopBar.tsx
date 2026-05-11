"use client";

import { Bell, ChevronDown, Crown, Menu } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

type TopBarProps = {
  title: string;
};

export function TopBar({ title }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 -mx-4 mb-4 border-b border-bean-border/60 bg-cream/80 px-4 py-3 backdrop-blur-xl md:-mx-6 md:px-6 lg:-mx-8 lg:mb-6 lg:border-b-0 lg:bg-transparent lg:px-8 lg:py-5">
      <div className="flex items-center justify-between lg:hidden">
        <Logo compact />
        <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-black text-bean-ink">{title}</h1>
        <button className="flex h-11 w-11 items-center justify-center rounded-full border border-bean-border bg-milk-purple-soft text-milk-purple shadow-insetSoft" aria-label="打开菜单">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <div className="hidden items-center justify-end gap-3 lg:flex">
        <button className="inline-flex h-11 items-center gap-2 rounded-full border border-amber-200 bg-amber-100/70 px-5 text-sm font-black text-amber-700 shadow-insetSoft">
          <Crown className="h-4 w-4" />
          升级 Pro
        </button>
        <button className="relative flex h-11 w-11 items-center justify-center rounded-full border border-bean-border bg-white text-bean-ink shadow-insetSoft" aria-label="通知">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-bean-danger text-[10px] font-black text-white">
            3
          </span>
        </button>
        <button className="inline-flex h-11 items-center gap-3 rounded-full border border-bean-border bg-white px-3 pl-2 text-sm font-black text-bean-ink shadow-insetSoft">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-milk-purple-soft text-base">豆</span>
          豆豆酱
          <ChevronDown className="h-4 w-4 text-bean-muted" />
        </button>
      </div>
    </header>
  );
}
