import { cn } from "@/lib/utils/cn";

const mascotRows = [
  "...P.....P...",
  "..PPP...PPP..",
  ".PPLPPPPPLPP.",
  ".PPPPPPPPPPP.",
  "PPWWPPPPPWWPP",
  "PWBBWPWPWBBWP",
  "PWWWRRRRWWWWP",
  "PPPWWYWWYPPPP",
  "..PPPPPPPPP..",
  "...PPP.PPP...",
  "....P...P...."
];

const beadColors: Record<string, string> = {
  P: "#8B5CF6",
  L: "#C4B5FD",
  W: "#FFF7EC",
  B: "#1F1B3A",
  R: "#FB7185",
  Y: "#FBBF24"
};

type BeadMascotProps = {
  size?: "sm" | "md" | "lg";
  withBoard?: boolean;
  className?: string;
};

export function BeadMascot({ size = "md", withBoard = false, className }: BeadMascotProps) {
  const beadSize = {
    sm: 6,
    md: 10,
    lg: 14
  }[size];

  const gap = Math.max(2, Math.round(beadSize * 0.16));

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        withBoard && "bead-board rounded-4xl border border-bean-border bg-white/70 p-7 shadow-soft",
        className
      )}
      aria-hidden="true"
    >
      {withBoard ? (
        <>
          <span className="bead-sparkle left-5 top-6 h-5 w-5" style={{ "--bead-color": "#FB7185" } as React.CSSProperties} />
          <span className="bead-sparkle right-8 top-10 h-4 w-4" style={{ "--bead-color": "#60A5FA" } as React.CSSProperties} />
          <span className="bead-sparkle bottom-8 left-9 h-4 w-4" style={{ "--bead-color": "#FBBF24" } as React.CSSProperties} />
        </>
      ) : null}
      <div
        className="grid drop-shadow-[0_14px_22px_rgba(124,58,237,0.22)]"
        style={{
          gridTemplateColumns: `repeat(${mascotRows[0].length}, ${beadSize}px)`,
          gap
        }}
      >
        {mascotRows.flatMap((row, rowIndex) =>
          row.split("").map((token, columnIndex) => (
            <span
              key={`${rowIndex}-${columnIndex}`}
              className={cn(
                "rounded-full",
                token === "." && "opacity-0",
                token !== "." && "shadow-[inset_-2px_-2px_4px_rgba(31,27,58,0.18),inset_2px_2px_4px_rgba(255,255,255,0.8)]"
              )}
              style={{
                width: beadSize,
                height: beadSize,
                backgroundColor: beadColors[token] ?? "transparent"
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
