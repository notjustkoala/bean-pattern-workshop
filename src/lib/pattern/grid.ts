import type { ColorMergeMode, PatternConfig } from "@/types/pattern";

export const PATTERN_LIMITS = {
  targetBeadCount: { min: 576, max: 176400, step: 256 },
  canvasColumns: { min: 24, max: 420, step: 2 },
  colorCount: { min: 8, max: 221, step: 1 },
  colorMergeStrength: { min: 0, max: 100, step: 1 },
  aspectRatio: { min: 0.2, max: 5 }
};

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeAspectRatio(aspectRatio?: number) {
  if (!Number.isFinite(aspectRatio) || !aspectRatio) return 1;
  return clamp(aspectRatio, PATTERN_LIMITS.aspectRatio.min, PATTERN_LIMITS.aspectRatio.max);
}

export function getColorMergeMode(strength: number): ColorMergeMode {
  if (strength <= 24) return "preserve";
  if (strength >= 68) return "compact";
  return "balanced";
}

export function getColorMergeLabel(strength: number) {
  if (strength <= 0) return "原色保真";
  const mode = getColorMergeMode(strength);
  if (mode === "preserve") return "保真";
  if (mode === "compact") return "强合并";
  return "均衡";
}

export function deriveGridFromColumns(canvasColumns: number, aspectRatio = 1) {
  const normalizedAspect = normalizeAspectRatio(aspectRatio);
  const gridWidth = Math.round(clamp(canvasColumns, PATTERN_LIMITS.canvasColumns.min, PATTERN_LIMITS.canvasColumns.max));
  const gridHeight = Math.round(clamp(gridWidth / normalizedAspect, 16, PATTERN_LIMITS.canvasColumns.max));

  return {
    aspectRatio: normalizedAspect,
    gridWidth,
    gridHeight,
    targetBeadCount: gridWidth * gridHeight
  };
}

export function deriveGridFromTargetBeadCount(targetBeadCount: number, aspectRatio = 1) {
  const normalizedAspect = normalizeAspectRatio(aspectRatio);
  const target = clamp(targetBeadCount, PATTERN_LIMITS.targetBeadCount.min, PATTERN_LIMITS.targetBeadCount.max);
  const preferredWidth = Math.round(Math.sqrt(target * normalizedAspect));

  return deriveGridFromColumns(preferredWidth, normalizedAspect);
}

export function deriveGridFromControls(targetBeadCount: number, canvasColumns: number, aspectRatio = 1) {
  const normalizedAspect = normalizeAspectRatio(aspectRatio);
  const currentTarget = Math.max(PATTERN_LIMITS.targetBeadCount.min, targetBeadCount);
  const currentColumns = clamp(canvasColumns, PATTERN_LIMITS.canvasColumns.min, PATTERN_LIMITS.canvasColumns.max);
  const targetColumns = Math.round(Math.sqrt(currentTarget * normalizedAspect));
  const shouldRespectColumns = Math.abs(currentColumns - targetColumns) > PATTERN_LIMITS.canvasColumns.step;

  return shouldRespectColumns
    ? deriveGridFromColumns(currentColumns, normalizedAspect)
    : deriveGridFromTargetBeadCount(currentTarget, normalizedAspect);
}

export function normalizePatternConfig(config: PatternConfig): PatternConfig {
  const colorMergeStrength = clamp(
    Math.round(config.colorMergeStrength ?? 30),
    PATTERN_LIMITS.colorMergeStrength.min,
    PATTERN_LIMITS.colorMergeStrength.max
  );
  const aspectRatio = normalizeAspectRatio(config.aspectRatio ?? config.gridWidth / config.gridHeight);
  const grid = deriveGridFromColumns(config.gridWidth, aspectRatio);

  return {
    ...config,
    ...grid,
    colorCount: Math.round(clamp(config.colorCount, PATTERN_LIMITS.colorCount.min, PATTERN_LIMITS.colorCount.max)),
    colorMergeStrength,
    colorMergeMode: getColorMergeMode(colorMergeStrength)
  };
}
