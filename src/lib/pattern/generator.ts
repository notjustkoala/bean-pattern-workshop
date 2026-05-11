import type { BeadColor, GeneratedPattern, PatternCell, PatternConfig } from "@/types/pattern";
import { createMaterialRecommendations } from "./material";
import { findNearestBeadColor, getTopColorIds, type Rgb } from "./palette-match";

export type PixelSource = {
  data: Uint8ClampedArray;
  width: number;
  height: number;
};

export type GeneratePatternInput = {
  config: PatternConfig;
  imageData: PixelSource;
  palette: BeadColor[];
};

type WorkingCell = PatternCell & {
  rgb: Rgb;
};

function shouldDropAsBackground(rgb: Rgb, alpha: number, config: PatternConfig) {
  if (alpha < 24) return true;
  if (config.backgroundMode !== "remove") return false;

  const [r, g, b] = rgb;
  const isNearWhite = r > 235 && g > 230 && b > 220;
  const isLowContrastCream = r > 220 && g > 210 && b > 195 && Math.abs(r - g) < 24 && Math.abs(g - b) < 36;

  return isNearWhite || isLowContrastCream;
}

function applyDifficulty(cell: WorkingCell, config: PatternConfig) {
  if (config.difficulty !== "easy") return cell;

  const isVeryLight =
    cell.rgb[0] > 238 &&
    cell.rgb[1] > 232 &&
    cell.rgb[2] > 220 &&
    (cell.colorId === "white" || cell.colorId === "cream");

  return isVeryLight ? { ...cell, isTransparent: true } : cell;
}

function createCell(x: number, y: number, rgb: Rgb, alpha: number, config: PatternConfig, palette: BeadColor[]): WorkingCell {
  if (shouldDropAsBackground(rgb, alpha, config)) {
    return {
      x,
      y,
      colorId: "transparent",
      colorCode: "--",
      hex: "transparent",
      symbol: "",
      rgb,
      isTransparent: true
    };
  }

  const color = findNearestBeadColor(rgb, palette);

  return applyDifficulty(
    {
      x,
      y,
      colorId: color.id,
      colorCode: color.colorCode,
      hex: color.hex,
      symbol: color.symbol,
      rgb,
      isTransparent: false
    },
    config
  );
}

function reduceCellsToColorLimit(cells: WorkingCell[][], palette: BeadColor[], maxColors: number) {
  const frequency = new Map<string, number>();

  for (const row of cells) {
    for (const cell of row) {
      if (!cell.isTransparent) {
        frequency.set(cell.colorId, (frequency.get(cell.colorId) ?? 0) + 1);
      }
    }
  }

  const topIds = new Set(getTopColorIds(frequency, Math.max(1, maxColors)));
  const retainedPalette = palette.filter((color) => topIds.has(color.id));

  if (retainedPalette.length === 0) return cells;

  return cells.map((row) =>
    row.map((cell) => {
      if (cell.isTransparent || topIds.has(cell.colorId)) return cell;

      const nearest = findNearestBeadColor(cell.rgb, retainedPalette);

      return {
        ...cell,
        colorId: nearest.id,
        colorCode: nearest.colorCode,
        hex: nearest.hex,
        symbol: nearest.symbol
      };
    })
  );
}

function collectUsedColors(cells: PatternCell[][], palette: BeadColor[]) {
  const usedIds = new Set<string>();

  for (const row of cells) {
    for (const cell of row) {
      if (!cell.isTransparent) usedIds.add(cell.colorId);
    }
  }

  return palette.filter((color) => usedIds.has(color.id));
}

export function generatePatternFromImageData({ config, imageData, palette }: GeneratePatternInput): GeneratedPattern {
  const rows: WorkingCell[][] = [];

  for (let y = 0; y < imageData.height; y += 1) {
    const row: WorkingCell[] = [];

    for (let x = 0; x < imageData.width; x += 1) {
      const offset = (y * imageData.width + x) * 4;
      const rgb: Rgb = [imageData.data[offset], imageData.data[offset + 1], imageData.data[offset + 2]];
      const alpha = imageData.data[offset + 3];

      row.push(createCell(x, y, rgb, alpha, config, palette));
    }

    rows.push(row);
  }

  const reducedRows = config.aiColorReduce ? reduceCellsToColorLimit(rows, palette, config.colorCount) : rows;
  const cells: PatternCell[][] = reducedRows.map((row) =>
    row.map((cell) => ({
      x: cell.x,
      y: cell.y,
      colorId: cell.colorId,
      colorCode: cell.colorCode,
      hex: cell.hex,
      symbol: cell.symbol,
      isTransparent: cell.isTransparent
    }))
  );
  const colors = collectUsedColors(cells, palette);
  const materials = createMaterialRecommendations(cells, colors);
  const totalBeads = materials.reduce((total, item) => total + item.requiredCount, 0);

  return {
    width: imageData.width,
    height: imageData.height,
    totalBeads,
    colorCount: colors.length,
    cells,
    colors,
    materials,
    createdAt: new Date().toISOString()
  };
}

