import type { BackgroundMode, Difficulty, PatternConfig } from "@/types/pattern";

export const SIZE_OPTIONS: Array<{
  value: PatternConfig["finishedSize"];
  label: string;
  detail: string;
  grid: [number, number];
}> = [
  { value: "small", label: "小号", detail: "约 9 x 9cm", grid: [24, 24] },
  { value: "medium", label: "中号", detail: "约 14 x 14cm", grid: [40, 40] },
  { value: "large", label: "大号", detail: "约 21 x 21cm", grid: [64, 64] },
  { value: "custom", label: "自定义", detail: "后续开放", grid: [40, 40] }
];

export const COLOR_OPTIONS = [
  { value: 12, label: "12 色", hint: "更简洁" },
  { value: 24, label: "24 色", hint: "新手友好" },
  { value: 36, label: "36 色", hint: "平衡细节" },
  { value: 48, label: "48 色", hint: "更丰富" }
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
