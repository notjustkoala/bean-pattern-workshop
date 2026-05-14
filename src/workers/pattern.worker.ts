/// <reference lib="webworker" />

import { generatePatternFromImageData } from "@/lib/pattern/generator";
import { normalizePatternConfig } from "@/lib/pattern/grid";
import type { PatternWorkerRequest, PatternWorkerResponse } from "@/lib/pattern/worker-types";
import type { PatternConfig } from "@/types/pattern";

const ctx: DedicatedWorkerGlobalScope = self as DedicatedWorkerGlobalScope;

function post(message: PatternWorkerResponse) {
  ctx.postMessage(message);
}

async function loadImageBitmap(imageUrl: string) {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error("图片加载失败");
  }

  const blob = await response.blob();
  return createImageBitmap(blob);
}

type SampledPixel = {
  rgb: [number, number, number];
  alpha: number;
};

type SamplingConfig = Pick<PatternConfig, "colorMergeStrength" | "imageMode">;

type ColorCluster = {
  key: string;
  count: number;
  weight: number;
  r: number;
  g: number;
  b: number;
  alpha: number;
  bestRgb: [number, number, number];
  bestScore: number;
};

function clampChannel(value: number) {
  return Math.round(Math.min(255, Math.max(0, value)));
}

function luma(r: number, g: number, b: number) {
  return r * 0.299 + g * 0.587 + b * 0.114;
}

function saturationScore(r: number, g: number, b: number) {
  return Math.max(r, g, b) - Math.min(r, g, b);
}

function colorDelta(a: [number, number, number], b: [number, number, number]) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
}

function getPixelLuma(source: Uint8ClampedArray, sourceWidth: number, sourceHeight: number, x: number, y: number) {
  const clampedX = Math.min(sourceWidth - 1, Math.max(0, x));
  const clampedY = Math.min(sourceHeight - 1, Math.max(0, y));
  const offset = (clampedY * sourceWidth + clampedX) * 4;

  return luma(source[offset], source[offset + 1], source[offset + 2]);
}

function getClusterKey(r: number, g: number, b: number, exactMode: boolean) {
  const bucketSize = exactMode ? 24 : 34;

  return `${Math.floor(r / bucketSize)}-${Math.floor(g / bucketSize)}-${Math.floor(b / bucketSize)}`;
}

function getClusterRgb(cluster: ColorCluster): [number, number, number] {
  return [
    clampChannel(cluster.r / cluster.count),
    clampChannel(cluster.g / cluster.count),
    clampChannel(cluster.b / cluster.count)
  ];
}

function scoreCluster(cluster: ColorCluster, totalSamples: number, exactMode: boolean) {
  const rgb = getClusterRgb(cluster);
  const currentLuma = luma(rgb[0], rgb[1], rgb[2]);
  const currentSaturation = saturationScore(rgb[0], rgb[1], rgb[2]);
  const coverage = cluster.count / Math.max(1, totalSamples);
  const detailBias = (255 - currentLuma) * 0.006 + currentSaturation * 0.012;
  const coveragePower = exactMode ? 0.72 : 1.1;

  return cluster.weight * coverage ** coveragePower * (1 + detailBias) + cluster.bestScore * (exactMode ? 0.28 : 0.08);
}

function chooseRealisticRepresentativePixel(
  source: Uint8ClampedArray,
  sourceWidth: number,
  sourceHeight: number,
  left: number,
  top: number,
  right: number,
  bottom: number
): SampledPixel {
  const minX = Math.max(0, Math.floor(left));
  const minY = Math.max(0, Math.floor(top));
  const maxX = Math.min(sourceWidth, Math.ceil(right));
  const maxY = Math.min(sourceHeight, Math.ceil(bottom));
  const stepX = Math.max(1, Math.floor((maxX - minX) / 8));
  const stepY = Math.max(1, Math.floor((maxY - minY) / 8));
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let totalAlpha = 0;
  let totalWeight = 0;

  for (let y = minY; y < maxY; y += stepY) {
    for (let x = minX; x < maxX; x += stepX) {
      const offset = (y * sourceWidth + x) * 4;
      const alpha = source[offset + 3];
      if (alpha < 16) continue;

      const weight = alpha / 255;
      totalR += source[offset] * weight;
      totalG += source[offset + 1] * weight;
      totalB += source[offset + 2] * weight;
      totalAlpha += alpha;
      totalWeight += weight;
    }
  }

  if (totalWeight <= 0) return { rgb: [255, 255, 255], alpha: 0 };

  return {
    rgb: [
      clampChannel(totalR / totalWeight),
      clampChannel(totalG / totalWeight),
      clampChannel(totalB / totalWeight)
    ],
    alpha: clampChannel(totalAlpha / Math.max(1, totalWeight))
  };
}

function chooseCartoonRepresentativePixel(
  source: Uint8ClampedArray,
  sourceWidth: number,
  sourceHeight: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
  config: SamplingConfig
): SampledPixel {
  const minX = Math.max(0, Math.floor(left));
  const minY = Math.max(0, Math.floor(top));
  const maxX = Math.min(sourceWidth, Math.ceil(right));
  const maxY = Math.min(sourceHeight, Math.ceil(bottom));
  const exactMode = config.colorMergeStrength <= 20;
  const sampleAxis = exactMode ? 15 : 9;
  const stepX = Math.max(1, Math.floor((maxX - minX) / sampleAxis));
  const stepY = Math.max(1, Math.floor((maxY - minY) / sampleAxis));
  const clusters = new Map<string, ColorCluster>();
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let totalAlpha = 0;
  let count = 0;
  let bestRgb: [number, number, number] = [255, 255, 255];
  let bestAlpha = 0;
  let bestScore = -Infinity;

  for (let y = minY; y < maxY; y += stepY) {
    for (let x = minX; x < maxX; x += stepX) {
      const offset = (y * sourceWidth + x) * 4;
      const alpha = source[offset + 3];
      if (alpha < 16) continue;

      const r = source[offset];
      const g = source[offset + 1];
      const b = source[offset + 2];
      const currentLuma = luma(r, g, b);
      const currentSaturation = saturationScore(r, g, b);
      const edgeStrength =
        Math.abs(currentLuma - getPixelLuma(source, sourceWidth, sourceHeight, x + stepX, y)) +
        Math.abs(currentLuma - getPixelLuma(source, sourceWidth, sourceHeight, x, y + stepY));
      const lineScore = (255 - currentLuma) * 1.02 + currentSaturation * 0.74 + edgeStrength * 0.52;
      const sampleWeight = 1 + (exactMode ? currentSaturation / 70 + edgeStrength / 82 + (255 - currentLuma) / 190 : currentSaturation / 180);
      const clusterKey = getClusterKey(r, g, b, exactMode);
      const cluster = clusters.get(clusterKey);

      totalR += r;
      totalG += g;
      totalB += b;
      totalAlpha += alpha;
      count += 1;

      if (cluster) {
        cluster.count += 1;
        cluster.weight += sampleWeight;
        cluster.r += r;
        cluster.g += g;
        cluster.b += b;
        cluster.alpha += alpha;
        if (lineScore > cluster.bestScore) {
          cluster.bestScore = lineScore;
          cluster.bestRgb = [r, g, b];
        }
      } else {
        clusters.set(clusterKey, {
          key: clusterKey,
          count: 1,
          weight: sampleWeight,
          r,
          g,
          b,
          alpha,
          bestRgb: [r, g, b],
          bestScore: lineScore
        });
      }

      if (lineScore > bestScore) {
        bestScore = lineScore;
        bestRgb = [r, g, b];
        bestAlpha = alpha;
      }
    }
  }

  if (!count) return { rgb: [255, 255, 255], alpha: 0 };

  const averageRgb: [number, number, number] = [
    clampChannel(totalR / count),
    clampChannel(totalG / count),
    clampChannel(totalB / count)
  ];
  const averageLuma = luma(averageRgb[0], averageRgb[1], averageRgb[2]);
  const bestLuma = luma(bestRgb[0], bestRgb[1], bestRgb[2]);
  const bestSaturation = saturationScore(bestRgb[0], bestRgb[1], bestRgb[2]);
  const bestCluster = [...clusters.values()].reduce<ColorCluster | null>((best, cluster) => {
    if (!best) return cluster;
    return scoreCluster(cluster, count, exactMode) > scoreCluster(best, count, exactMode) ? cluster : best;
  }, null);
  const clusterRgb = bestCluster ? getClusterRgb(bestCluster) : bestRgb;
  const clusterLuma = luma(clusterRgb[0], clusterRgb[1], clusterRgb[2]);
  const clusterSaturation = saturationScore(clusterRgb[0], clusterRgb[1], clusterRgb[2]);
  const clusterCoverage = bestCluster ? bestCluster.count / count : 0;
  const hasClusterSignal =
    exactMode &&
    Boolean(bestCluster) &&
    bestCluster!.count >= Math.max(2, Math.ceil(count * 0.035)) &&
    colorDelta(clusterRgb, averageRgb) > 24 &&
    (averageLuma - clusterLuma > 18 || clusterSaturation > 46 || bestCluster!.bestScore - bestScore * 0.64 > 18);
  const hasLineSignal =
    exactMode &&
    bestScore > (255 - averageLuma) * 1.12 + saturationScore(averageRgb[0], averageRgb[1], averageRgb[2]) * 0.72 + 32 &&
    (averageLuma - bestLuma > 26 || bestSaturation > 58) &&
    colorDelta(bestRgb, averageRgb) > 38;

  if (!hasLineSignal && !hasClusterSignal) {
    return {
      rgb: averageRgb,
      alpha: Math.round(totalAlpha / count)
    };
  }

  if (hasClusterSignal) {
    const detailWeight = clusterCoverage >= 0.28 ? 0.96 : 0.88;

    return {
      rgb: [
        clampChannel(clusterRgb[0] * detailWeight + averageRgb[0] * (1 - detailWeight)),
        clampChannel(clusterRgb[1] * detailWeight + averageRgb[1] * (1 - detailWeight)),
        clampChannel(clusterRgb[2] * detailWeight + averageRgb[2] * (1 - detailWeight))
      ],
      alpha: Math.max(Math.round((bestCluster?.alpha ?? totalAlpha) / Math.max(1, bestCluster?.count ?? count)), Math.round(totalAlpha / count))
    };
  }

  return {
    rgb: [
      clampChannel(bestRgb[0] * 0.82 + averageRgb[0] * 0.18),
      clampChannel(bestRgb[1] * 0.82 + averageRgb[1] * 0.18),
      clampChannel(bestRgb[2] * 0.82 + averageRgb[2] * 0.18)
    ],
    alpha: Math.max(bestAlpha, Math.round(totalAlpha / count))
  };
}

async function createPixelSource(imageUrl: string, width: number, height: number, config: SamplingConfig) {
  const bitmap = await loadImageBitmap(imageUrl);
  const maxSourceSide = 1800;
  const sourceScale = Math.min(1, maxSourceSide / Math.max(bitmap.width, bitmap.height));
  const sourceWidth = Math.max(width, Math.round(bitmap.width * sourceScale));
  const sourceHeight = Math.max(height, Math.round(bitmap.height * sourceScale));
  const canvas = new OffscreenCanvas(sourceWidth, sourceHeight);
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    throw new Error("当前浏览器不支持 Worker Canvas");
  }

  context.imageSmoothingEnabled = config.imageMode !== "cartoon";
  context.imageSmoothingQuality = config.colorMergeStrength <= 16 ? "medium" : "high";
  context.clearRect(0, 0, sourceWidth, sourceHeight);
  context.drawImage(bitmap, 0, 0, sourceWidth, sourceHeight);
  bitmap.close();

  const sourceImageData = context.getImageData(0, 0, sourceWidth, sourceHeight);
  const target = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const left = (x / width) * sourceWidth;
      const top = (y / height) * sourceHeight;
      const right = ((x + 1) / width) * sourceWidth;
      const bottom = ((y + 1) / height) * sourceHeight;
      const bleedX = config.imageMode === "cartoon" ? (right - left) * 0.12 : 0;
      const bleedY = config.imageMode === "cartoon" ? (bottom - top) * 0.12 : 0;
      const sampled =
        config.imageMode === "cartoon"
          ? chooseCartoonRepresentativePixel(sourceImageData.data, sourceWidth, sourceHeight, left - bleedX, top - bleedY, right + bleedX, bottom + bleedY, config)
          : chooseRealisticRepresentativePixel(sourceImageData.data, sourceWidth, sourceHeight, left, top, right, bottom);
      const offset = (y * width + x) * 4;
      target[offset] = sampled.rgb[0];
      target[offset + 1] = sampled.rgb[1];
      target[offset + 2] = sampled.rgb[2];
      target[offset + 3] = sampled.alpha;
    }
  }

  return {
    data: target,
    width,
    height
  };
}

ctx.onmessage = async (event: MessageEvent<PatternWorkerRequest>) => {
  if (event.data.type !== "generate") return;

  const { imageUrl, config, palette } = event.data.payload;
  const normalizedConfig = normalizePatternConfig(config);

  try {
    post({ type: "progress", progress: 12, message: "正在加载图片" });
    const imageData = await createPixelSource(imageUrl, normalizedConfig.gridWidth, normalizedConfig.gridHeight, normalizedConfig);

    post({
      type: "progress",
      progress: 38,
      message: normalizedConfig.imageMode === "cartoon" ? "正在进行Q版线条保真采样" : "正在进行真实图片柔和采样"
    });
    const pattern = generatePatternFromImageData({ config: normalizedConfig, imageData, palette });

    post({
      type: "progress",
      progress: 78,
      message: normalizedConfig.imageMode === "cartoon" ? "正在保留细节色并统计材料" : "正在合并相近色并统计材料"
    });
    post({ type: "progress", progress: 100, message: "图纸生成完成" });
    post({ type: "success", pattern });
  } catch (error) {
    post({
      type: "error",
      message: error instanceof Error ? error.message : "图纸生成失败"
    });
  }
};

export {};
