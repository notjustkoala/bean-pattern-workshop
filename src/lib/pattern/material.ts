import type { BeadColor, MaterialItem, PatternCell } from "@/types/pattern";

export function createMaterialRecommendations(cells: PatternCell[][], colors: BeadColor[]): MaterialItem[] {
  const countMap = new Map<string, number>();

  for (const row of cells) {
    for (const cell of row) {
      if (!cell.isTransparent) {
        countMap.set(cell.colorId, (countMap.get(cell.colorId) ?? 0) + 1);
      }
    }
  }

  return colors
    .map((color) => {
      const requiredCount = countMap.get(color.id) ?? 0;
      const spareRate = requiredCount > 500 ? 0.08 : 0.1;
      const recommendedCount = Math.ceil((requiredCount * (1 + spareRate)) / 10) * 10;

      return {
        colorId: color.id,
        colorName: color.name,
        colorCode: color.colorCode,
        hex: color.hex,
        requiredCount,
        recommendedCount,
        spareCount: recommendedCount - requiredCount,
        spareRate,
        alternativeColors: []
      } satisfies MaterialItem;
    })
    .filter((item) => item.requiredCount > 0)
    .sort((a, b) => b.requiredCount - a.requiredCount);
}
