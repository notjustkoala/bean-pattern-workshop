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

function rgbLuma(rgb: Rgb) {
  return rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114;
}

function rgbSaturation(rgb: Rgb) {
  return Math.max(...rgb) - Math.min(...rgb);
}

function getMatchScore(cell: WorkingCell, color: LabBeadColor, config: PatternConfig) {
  const sourceChroma = labChroma(cell.lab);
  const cartoonExactMode = config.imageMode === "cartoon" && config.colorMergeStrength <= 20;
  const preserveMode = config.colorMergeStrength <= 0;
  const chromaPenaltyWeight = cartoonExactMode ? 0.52 : preserveMode ? 0.3 : 0.16;
  const rgbPenaltyWeight = cartoonExactMode ? 0.072 : preserveMode ? 0.018 : 0.008;
  const lightnessPenaltyWeight = cartoonExactMode ? 0.36 : preserveMode ? 0.06 : 0.04;

  return (
    labDistance(cell.lab, color.lab) +
    Math.abs(sourceChroma - labChroma(color.lab)) * chromaPenaltyWeight +
    Math.abs(rgbLuma(cell.rgb) - rgbLuma(color.rgb)) * lightnessPenaltyWeight +
    Math.abs(cell.rgb[0] - color.rgb[0]) * rgbPenaltyWeight +
    Math.abs(cell.rgb[1] - color.rgb[1]) * rgbPenaltyWeight +
    Math.abs(cell.rgb[2] - color.rgb[2]) * rgbPenaltyWeight
  );
}

function findNearestMardColor(cell: WorkingCell, palette: LabBeadColor[], config: PatternConfig) {
  return palette.reduce((nearest, current) => {
    return getMatchScore(cell, current, config) < getMatchScore(cell, nearest, config) ? current : nearest;
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

function getPaletteRetentionScore(color: LabBeadColor, count: number, totalBeads: number, config: PatternConfig) {
  const chroma = labChroma(color.lab);
  const lightness = rgbLuma(color.rgb);
  const cartoonMode = config.imageMode === "cartoon";
  const exactMode = cartoonMode && config.colorMergeStrength <= 24;
  const detailWeight = 1 + Math.min(0.62, chroma / 145) + (lightness < 96 ? 0.52 : 0) + (lightness > 226 ? -0.18 : 0);
  const rareButVisible = count >= Math.max(2, totalBeads * 0.00018) ? 1.18 : 1;

  if (exactMode) return count * detailWeight * rareButVisible;
  if (config.difficulty === "detailed") return count * (1 + (detailWeight - 1) * 0.28);

  return count;
}

function isDetailColor(color: LabBeadColor) {
  return labChroma(color.lab) > 38 || rgbLuma(color.rgb) < 92;
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

  const rankedColors = [...frequency.entries()].sort((a, b) => {
    const colorA = colorById.get(a[0]);
    const colorB = colorById.get(b[0]);
    if (!colorA || !colorB) return b[1] - a[1];

    return getPaletteRetentionScore(colorB, b[1], totalBeads, config) - getPaletteRetentionScore(colorA, a[1], totalBeads, config);
  });

  for (const [colorId, count] of rankedColors) {
    const color = colorById.get(colorId);
    if (!color) continue;

    const isRare = count <= rareCountThreshold && !(config.imageMode === "cartoon" && config.difficulty === "detailed" && isDetailColor(color));
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

function isCartoonLineCell(cell?: WorkingCell) {
  if (!cell || cell.isTransparent) return false;

  const lightness = rgbLuma(cell.rgb);
  const saturation = rgbSaturation(cell.rgb);

  return lightness < 118 || (lightness < 148 && saturation > 34);
}

function areLineColorsCompatible(a: WorkingCell, b: WorkingCell) {
  const bothVeryDark = rgbLuma(a.rgb) < 96 && rgbLuma(b.rgb) < 96;

  return bothVeryDark || Math.abs(rgbLuma(a.rgb) - rgbLuma(b.rgb)) < 46 || Math.abs(labChroma(a.lab) - labChroma(b.lab)) < 34;
}

function lineBridgeStrength(a: WorkingCell, b: WorkingCell) {
  const darkStrength = Math.max(0, 180 - rgbLuma(a.rgb)) + Math.max(0, 180 - rgbLuma(b.rgb));
  const saturationStrength = rgbSaturation(a.rgb) + rgbSaturation(b.rgb);

  return darkStrength + saturationStrength * 0.42;
}

function copyLineCell(target: WorkingCell, source: WorkingCell): WorkingCell {
  return {
    ...target,
    colorId: source.colorId,
    colorCode: source.colorCode,
    hex: source.hex,
    symbol: source.symbol,
    rgb: source.rgb,
    lab: source.lab,
    isTransparent: false
  };
}

function pickLineSource(a: WorkingCell, b: WorkingCell) {
  if (a.colorId === b.colorId) return a;
  return rgbLuma(a.rgb) <= rgbLuma(b.rgb) ? a : b;
}

function bridgeCartoonLineGaps(cells: WorkingCell[][], config: PatternConfig) {
  if (config.imageMode !== "cartoon" || config.colorMergeStrength > 24) return cells;

  const height = cells.length;
  const width = cells[0]?.length ?? 0;
  const result = cells.map((row) => row.map((cell) => ({ ...cell })));
  const directions = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1]
  ] as const;
  const getCell = (x: number, y: number) => (x >= 0 && x < width && y >= 0 && y < height ? cells[y][x] : undefined);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const current = cells[y][x];
      if (isCartoonLineCell(current)) continue;

      for (const [dx, dy] of directions) {
        const before = getCell(x - dx, y - dy);
        const after = getCell(x + dx, y + dy);

        if (isCartoonLineCell(before) && isCartoonLineCell(after) && before && after && areLineColorsCompatible(before, after) && lineBridgeStrength(before, after) > 128) {
          result[y][x] = copyLineCell(current, pickLineSource(before, after));
          break;
        }
      }
    }
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      for (const [dx, dy] of directions) {
        const first = getCell(x, y);
        const second = getCell(x + dx, y + dy);
        const third = getCell(x + dx * 2, y + dy * 2);
        const fourth = getCell(x + dx * 3, y + dy * 3);

        if (
          isCartoonLineCell(first) &&
          second &&
          third &&
          isCartoonLineCell(fourth) &&
          first &&
          fourth &&
          !isCartoonLineCell(second) &&
          !isCartoonLineCell(third) &&
          areLineColorsCompatible(first, fourth) &&
          lineBridgeStrength(first, fourth) > 178
        ) {
          const source = pickLineSource(first, fourth);
          result[y + dy][x + dx] = copyLineCell(second, source);
          result[y + dy * 2][x + dx * 2] = copyLineCell(third, source);
        }
      }
    }
  }

  return result;
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
  const mappedRows = bridgeCartoonLineGaps(applyPalette(sourceRows, workingPalette, normalizedConfig), normalizedConfig);
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
