import type { BeadColor } from "@/types/pattern";

export type Rgb = [number, number, number];

export function colorDistance(a: Rgb, b: Rgb) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

export function findNearestBeadColor(rgb: Rgb, palette: BeadColor[]) {
  return palette.reduce((nearest, current) => {
    return colorDistance(rgb, current.rgb) < colorDistance(rgb, nearest.rgb) ? current : nearest;
  }, palette[0]);
}

export function getTopColorIds(frequency: Map<string, number>, limit: number) {
  return [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([colorId]) => colorId);
}
