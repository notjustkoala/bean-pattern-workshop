import type { BeadColor } from "@/types/pattern";

export type Rgb = [number, number, number];
export type Lab = [number, number, number];
export type LabBeadColor = BeadColor & {
  lab: Lab;
};

export function colorDistance(a: Rgb, b: Rgb) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

function pivotRgb(value: number) {
  const normalized = value / 255;
  return normalized > 0.04045 ? ((normalized + 0.055) / 1.055) ** 2.4 : normalized / 12.92;
}

function pivotXyz(value: number) {
  return value > 0.008856 ? Math.cbrt(value) : 7.787 * value + 16 / 116;
}

export function rgbToLab(rgb: Rgb): Lab {
  const r = pivotRgb(rgb[0]);
  const g = pivotRgb(rgb[1]);
  const b = pivotRgb(rgb[2]);

  const x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / 0.95047;
  const y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
  const z = (r * 0.0193339 + g * 0.119192 + b * 0.9503041) / 1.08883;

  const fx = pivotXyz(x);
  const fy = pivotXyz(y);
  const fz = pivotXyz(z);

  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

export function labDistance(a: Lab, b: Lab) {
  const lightnessWeight = 0.72;
  const chromaWeight = 1.12;

  return Math.sqrt(
    ((a[0] - b[0]) * lightnessWeight) ** 2 +
      ((a[1] - b[1]) * chromaWeight) ** 2 +
      ((a[2] - b[2]) * chromaWeight) ** 2
  );
}

export function createLabPalette(palette: BeadColor[]): LabBeadColor[] {
  return palette.map((color) => ({
    ...color,
    lab: rgbToLab(color.rgb)
  }));
}

export function findNearestBeadColor(rgb: Rgb, palette: BeadColor[]) {
  return palette.reduce((nearest, current) => {
    return colorDistance(rgb, current.rgb) < colorDistance(rgb, nearest.rgb) ? current : nearest;
  }, palette[0]);
}

export function findNearestLabBeadColor(lab: Lab, palette: LabBeadColor[]) {
  return palette.reduce((nearest, current) => {
    return labDistance(lab, current.lab) < labDistance(lab, nearest.lab) ? current : nearest;
  }, palette[0]);
}

export function getTopColorIds(frequency: Map<string, number>, limit: number) {
  return [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([colorId]) => colorId);
}
