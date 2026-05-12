import type { BackgroundMode, Difficulty, PatternConfig } from "@/types/pattern";

export const SIZE_OPTIONS: Array<{
  value: PatternConfig["finishedSize"];
  label: string;
  detail: string;
  grid: [number, number];
}> = [
  { value: "small", label: "小号", detail: "80 x 80", grid: [80, 80] },
  { value: "medium", label: "中号", detail: "120 x 120", grid: [120, 120] },
  { value: "large", label: "大号", detail: "180 x 180", grid: [180, 180] },
  { value: "custom", label: "自定义", detail: "最高 420 列", grid: [160, 160] }
];

export const COLOR_OPTIONS = [
  { value: 48, label: "48 色", hint: "更简洁" },
  { value: 96, label: "96 色", hint: "复杂图片" },
  { value: 128, label: "128 色", hint: "高保真" },
  { value: 221, label: "221 色", hint: "Mard 全色" }
];

export const DIFFICULTY_OPTIONS: Array<{
  value: Difficulty;
  label: string;
  hint: string;
}> = [
  { value: "easy", label: "简单", hint: "大色块" },
  { value: "standard", label: "标准", hint: "平衡推荐" },
  { value: "detailed", label: "精细", hint: "细节丰富" }
];

export const BACKGROUND_OPTIONS: Array<{
  value: BackgroundMode;
  label: string;
  hint: string;
}> = [
  { value: "keep", label: "保留背景", hint: "完整画面" },
  { value: "simplify", label: "简化背景", hint: "主体更清晰" },
  { value: "remove", label: "去除背景", hint: "后续增强" }
];
