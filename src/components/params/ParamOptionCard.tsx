import { cn } from "@/lib/utils/cn";

type ParamOptionCardProps = {
  label: string;
  hint?: string;
  active?: boolean;
  badge?: string;
  disabled?: boolean;
  onClick?: () => void;
};

export function ParamOptionCard({ label, hint, active, badge, disabled, onClick }: ParamOptionCardProps) {
  return (
    <button
      className={cn(
        "relative min-h-16 rounded-2xl border px-4 py-3 text-center transition",
        active
          ? "border-milk-purple bg-milk-purple-soft text-milk-purple shadow-insetSoft"
          : "border-bean-border bg-white text-bean-ink hover:border-milk-purple-light hover:bg-milk-purple-soft/30",
        disabled && "cursor-not-allowed opacity-55"
      )}
      disabled={disabled}
      type="button"
      onClick={onClick}
    >
      {badge ? (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-bean-success px-2 py-0.5 text-[10px] font-black text-white">
          {badge}
        </span>
      ) : null}
      <span className="block text-base font-black">{label}</span>
      {hint ? <span className="mt-1 block text-xs font-semibold text-bean-muted">{hint}</span> : null}
    </button>
  );
}
