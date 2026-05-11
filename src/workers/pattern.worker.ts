/// <reference lib="webworker" />

import { generatePatternFromImageData } from "@/lib/pattern/generator";
import type { PatternWorkerRequest, PatternWorkerResponse } from "@/lib/pattern/worker-types";

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

async function createPixelSource(imageUrl: string, width: number, height: number) {
  const bitmap = await loadImageBitmap(imageUrl);
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    throw new Error("当前浏览器不支持 Worker Canvas");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.clearRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const imageData = context.getImageData(0, 0, width, height);

  return {
    data: imageData.data,
    width,
    height
  };
}

ctx.onmessage = async (event: MessageEvent<PatternWorkerRequest>) => {
  if (event.data.type !== "generate") return;

  const { imageUrl, config, palette } = event.data.payload;

  try {
    post({ type: "progress", progress: 12, message: "正在加载图片" });
    const imageData = await createPixelSource(imageUrl, config.gridWidth, config.gridHeight);

    post({ type: "progress", progress: 38, message: "正在采样像素网格" });
    const pattern = generatePatternFromImageData({ config, imageData, palette });

    post({ type: "progress", progress: 78, message: "正在统计颜色和材料" });
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
