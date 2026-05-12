import type { PatternCell } from "@/types/pattern";

export type DrawPatternOptions = {
  cellSize?: number;
  showSymbols?: boolean;
  showGrid?: boolean;
  showCoordinates?: boolean;
  highlightColorId?: string | null;
};

export function drawPatternPreview(canvas: HTMLCanvasElement | OffscreenCanvas, cells: PatternCell[][], options: DrawPatternOptions = {}) {
  const context = canvas.getContext("2d") as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
  if (!context) return;

  const cellSize = options.cellSize ?? 10;
  const width = cells[0]?.length ?? 0;
  const height = cells.length;
  const axisSize = options.showCoordinates ? Math.max(26, cellSize * 1.6) : 0;

  canvas.width = width * cellSize + axisSize;
  canvas.height = height * cellSize + axisSize;

  context.fillStyle = "#FFFDF8";
  context.fillRect(0, 0, canvas.width, canvas.height);

  if (options.showCoordinates) {
    context.fillStyle = "#7A7390";
    context.font = `${Math.max(9, cellSize * 0.42)}px sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";

    for (let x = 0; x < width; x += 1) {
      if (x === 0 || (x + 1) % 5 === 0) {
        context.fillText(String(x + 1), axisSize + x * cellSize + cellSize / 2, axisSize / 2);
      }
    }

    for (let y = 0; y < height; y += 1) {
      if (y === 0 || (y + 1) % 5 === 0) {
        context.fillText(String(y + 1), axisSize / 2, axisSize + y * cellSize + cellSize / 2);
      }
    }
  }

  if (options.showGrid) {
    context.strokeStyle = "rgba(124, 58, 237, 0.13)";
    context.lineWidth = 1;

    for (let x = 0; x <= width; x += 1) {
      context.beginPath();
      context.moveTo(axisSize + x * cellSize, axisSize);
      context.lineTo(axisSize + x * cellSize, axisSize + height * cellSize);
      context.stroke();
    }

    for (let y = 0; y <= height; y += 1) {
      context.beginPath();
      context.moveTo(axisSize, axisSize + y * cellSize);
      context.lineTo(axisSize + width * cellSize, axisSize + y * cellSize);
      context.stroke();
    }
  }

  for (const row of cells) {
    for (const cell of row) {
      if (cell.isTransparent) continue;

      const cx = axisSize + cell.x * cellSize + cellSize / 2;
      const cy = axisSize + cell.y * cellSize + cellSize / 2;
      const radius = Math.max(2, cellSize * 0.42);
      const dim = Boolean(options.highlightColorId && cell.colorId !== options.highlightColorId);

      context.globalAlpha = dim ? 0.24 : 1;
      context.beginPath();
      context.fillStyle = cell.hex;
      context.arc(cx, cy, radius, 0, Math.PI * 2);
      context.fill();

      context.strokeStyle = dim ? "rgba(31, 27, 58, 0.08)" : "rgba(31, 27, 58, 0.15)";
      context.lineWidth = 1;
      context.stroke();

      if (options.showSymbols && cellSize >= 10) {
        context.fillStyle = "#1F1B3A";
        context.font = `${Math.max(7, cellSize * 0.42)}px sans-serif`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(cell.symbol, cx, cy);
      }

      context.globalAlpha = 1;
    }
  }
}
