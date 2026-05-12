import type { BeadColor, GeneratedPattern, PatternCell, PatternConfig } from "@/types/pattern";
import { normalizePatternConfig } from "./grid";
import { createMaterialRecommendations } from "./material";
import {
  createLabPalette,
  labDistance,
  rgbToLab,
  type Lab,
  type LabBeadColor,
  type Rgb
} from "./palette-match";

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
  lab: Lab;
};

function shouldDropAsBackground(rgb: Rgb, alpha: number, config: PatternConfig) {
  if (alpha < 24) return true;
  if (config.backgroundMode !== "remove") return false;

  const [r, g, b] = rgb;
  const isNearWhite = r > 235 && g > 230 && b > 220;
  const isLowContrastCream = r > 220 && g > 210 && b > 195 && Math.abs(r - g) < 24 && Math.abs(g - b) < 36;

  return isNearWhite || isLowContrastCream;
}

function clampChannel(value: number) {
  return Math.round(Math.min(255, Math.max(0, value)));
}

function enhanceRgb(rgb: Rgb, config: PatternConfig): Rgb {
  if (config.colorMergeStrength <= 0) return rgb;

  const mergeRatio = config.colorMergeStrength / 100;
  const contrast = 1 + mergeRatio * 0.08 + (config.difficulty === "detailed" ? 0.03 : config.difficulty === "easy" ? -0.03 : 0);
  const saturation = 1 + mergeRatio * 0.06 + (config.difficulty === "detailed" ? 0.04 : config.difficulty === "easy" ? -0.06 : 0);
  const [r, g, b] = rgb;
  const gray = r * 0.299 + g * 0.587 + b * 0.114;

  return [
    clampChannel((gray + (r - gray) * saturation - 128) * contrast + 128),
    clampChannel((gray + (g - gray) * saturation - 128) * contrast + 128),
    clampChannel((gray + (b - gray) * saturation - 128) * contrast + 128)
  ];
}

function labChroma(lab: Lab) {
  return Math.sqrt(lab[1] ** 2 + lab[2] ** 2);
}

function findNearestMardColor(cell: WorkingCell, palette: LabBeadColor[], config: PatternConfig) {
  const sourceChroma = labChroma(cell.lab);
  const chromaPenaltyWeight = config.colorMergeStrength <= 0 ? 0.32 : 0.16;
  const rgbPenaltyWeight = config.colorMergeStrength <= 0 ? 0.018 : 0.008;

  return palette.reduce((nearest, current) => {
    const currentScore =
      labDistance(cell.lab, current.lab) +
      Math.abs(sourceChroma - labChroma(current.lab)) * chromaPenaltyWeight +
      Math.abs(cell.rgb[0] - current.rgb[0]) * rgbPenaltyWeight +
      Math.abs(cell.rgb[1] - current.rgb[1]) * rgbPenaltyWeight +
      Math.abs(cell.rgb[2] - current.rgb[2]) * rgbPenaltyWeight;
    const nearestScore =
      labDistance(cell.lab, nearest.lab) +
      Math.abs(sourceChroma - labChroma(nearest.lab)) * chromaPenaltyWeight +
      Math.abs(cell.rgb[0] - nearest.rgb[0]) * rgbPenaltyWeight +
      Math.abs(cell.rgb[1] - nearest.rgb[1]) * rgbPenaltyWeight +
      Math.abs(cell.rgb[2] - nearest.rgb[2]) * rgbPenaltyWeight;

    return currentScore < nearestScore ? current : nearest;
  }, palette[0]);
}

function applyDifficulty(cell: WorkingCell, config: PatternConfig) {
  if (config.colorMergeStrength <= 0 || config.difficulty !== "easy") return cell;

  const isVeryLight =
    cell.rgb[0] > 238 &&
    cell.rgb[1] > 232 &&
    cell.rgb[2] > 220 &&
    (cell.colorCode === "H1" || cell.colorCode === "H2" || cell.colorCode === "H18");

  return isVeryLight ? { ...cell, isTransparent: true } : cell;
}

function createSourceCell(x: number, y: number, sourceRgb: Rgb, alpha: number, config: PatternConfig): WorkingCell {
  const rgb = enhanceRgb(sourceRgb, config);
  const lab = rgbToLab(rgb);

  if (shouldDropAsBackground(rgb, alpha, config)) {
    return {
      x,
      y,
      colorId: "transparent",
      colorCode: "--",
      hex: "transparent",
      symbol: "",
      rgb,
      lab,
      isTransparent: true
    };
  }

  return {
    x,
    y,
    colorId: "",
    colorCode: "",
    hex: "",
    symbol: "",
    rgb,
    lab,
    isTransparent: false
  };
}

function getEffectiveColorLimit(config: PatternConfig) {
  if (!config.aiColorReduce || config.colorMergeStrength <= 0) return config.colorCount;

  const mergeRatio = config.colorMergeStrength / 100;
  return Math.max(4, Math.round(config.colorCount * (1 - mergeRatio * 0.72)));
}

function createMaterialPalette(cells: WorkingCell[][], palette: BeadColor[], config: PatternConfig) {
  const labPalette = createLabPalette(palette);
  const frequency = new Map<string, number>();
  const totalBeads = cells.reduce((total, row) => total + row.filter((cell) => !cell.isTransparent).length, 0);

  for (const row of cells) {
    for (const cell of row) {
      if (cell.isTransparent) continue;
      const nearest = findNearestMardColor(cell, labPalette, config);
      frequency.set(nearest.id, (frequency.get(nearest.id) ?? 0) + 1);
    }
  }

  const colorById = new Map(labPalette.map((color) => [color.id, color]));
  const mergeRatio = config.colorMergeStrength / 100;
  const effectiveLimit = getEffectiveColorLimit(config);
  const similarityThreshold = mergeRatio <= 0 ? 0 : 1.2 + mergeRatio * 13;
  const rareCountThreshold = Math.round(totalBeads * mergeRatio * 0.0015);
  const retained: LabBeadColor[] = [];

  for (const [colorId, count] of [...frequency.entries()].sort((a, b) => b[1] - a[1])) {
    const color = colorById.get(colorId);
    if (!color) continue;

    const isRare = count <= rareCountThreshold;
    const isTooSimilar = similarityThreshold > 0 && retained.some((retainedColor) => labDistance(color.lab, retainedColor.lab) < similarityThreshold);

    if (retained.length < effectiveLimit && (!isRare || retained.length < Math.max(8, effectiveLimit * 0.75)) && !isTooSimilar) {
      retained.push(color);
    }
  }

  return retained.length ? retained : labPalette.slice(0, Math.min(effectiveLimit, labPalette.length));
}

function selectWorkingPalette(cells: WorkingCell[][], materialPalette: BeadColor[], config: PatternConfig) {
  return createMaterialPalette(cells, materialPalette, config);
}

function applyPalette(cells: WorkingCell[][], palette: LabBeadColor[], config: PatternConfig) {
  return cells.map((row) =>
    row.map((cell) => {
      if (cell.isTransparent) return cell;

      const nearest = findNearestMardColor(cell, palette, config);

      return applyDifficulty(
        {
          ...cell,
          colorId: nearest.id,
          colorCode: nearest.colorCode,
          hex: nearest.hex,
          symbol: nearest.symbol
        },
        config
      );
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
  const normalizedConfig = normalizePatternConfig(config);
  const sourceRows: WorkingCell[][] = [];

  for (let y = 0; y < imageData.height; y += 1) {
    const row: WorkingCell[] = [];

    for (let x = 0; x < imageData.width; x += 1) {
      const offset = (y * imageData.width + x) * 4;
      const rgb: Rgb = [imageData.data[offset], imageData.data[offset + 1], imageData.data[offset + 2]];
      const alpha = imageData.data[offset + 3];

      row.push(createSourceCell(x, y, rgb, alpha, normalizedConfig));
    }

    sourceRows.push(row);
  }

  const workingPalette = selectWorkingPalette(sourceRows, palette, normalizedConfig);
  const mappedRows = applyPalette(sourceRows, workingPalette, normalizedConfig);
  const cells: PatternCell[][] = mappedRows.map((row) =>
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
  const colors = collectUsedColors(cells, workingPalette);
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
