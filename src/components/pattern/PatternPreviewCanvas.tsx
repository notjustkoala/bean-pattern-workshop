"use client";

import { useEffect, useRef } from "react";
import type { GeneratedPattern } from "@/types/pattern";
import { drawPatternPreview, type DrawPatternOptions } from "@/lib/pattern/preview";

export function PatternPreviewCanvas({
  pattern,
  cellSize,
  className,
  highlightColorId,
  showCoordinates = false,
  showGrid = false,
  showSymbols = false
}: {
  pattern: GeneratedPattern;
  cellSize?: number;
  className?: string;
  highlightColorId?: string | null;
  showCoordinates?: boolean;
  showGrid?: boolean;
  showSymbols?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const options: DrawPatternOptions = {
      cellSize: cellSize ?? (pattern.width > 48 ? 8 : 12),
      showSymbols,
      showGrid,
      showCoordinates,
      highlightColorId
    };
    drawPatternPreview(canvasRef.current, pattern.cells, options);
  }, [cellSize, highlightColorId, pattern, showCoordinates, showGrid, showSymbols]);

  return <canvas ref={canvasRef} className={className ?? "max-h-[620px] max-w-full rounded-3xl bg-cream shadow-soft"} />;
}
