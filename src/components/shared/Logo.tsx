import { APP_CONFIG } from "@/lib/constants/app-config";
import { cn } from "@/lib/utils/cn";
import { BeadMascot } from "./BeadMascot";

type LogoProps = {
  compact?: boolean;
  className?: string;
};

export function Logo({ compact = false, className }: LogoProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-bean-border bg-white shadow-bead">
        <BeadMascot size="sm" />
      </div>
      {!compact ? (
        <div className="min-w-0">
          <p className="truncate text-xl font-black text-bean-ink">{APP_CONFIG.name}</p>
          <p className="truncate text-xs font-medium text-bean-muted">{APP_CONFIG.subtitle}</p>
        </div>
      ) : null}
    </div>
  );
}
