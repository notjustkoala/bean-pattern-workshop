export type Difficulty = "easy" | "standard" | "detailed";
export type BackgroundMode = "simplify" | "keep" | "remove";
export type BeadSize = "2.6mm" | "5mm";
export type ColorMergeMode = "preserve" | "balanced" | "compact";
export type ImageSourceMode = "realistic" | "cartoon";

export type PatternConfig = {
  finishedSize: "small" | "medium" | "large" | "custom";
  customWidthCm?: number;
  customHeightCm?: number;
  beadSize: BeadSize;
  imageMode: ImageSourceMode;
  aspectRatio: number;
  targetBeadCount: number;
  gridWidth: number;
  gridHeight: number;
  colorCount: number;
  colorMergeStrength: number;
  colorMergeMode: ColorMergeMode;
  difficulty: Difficulty;
  backgroundMode: BackgroundMode;
  aiColorReduce: boolean;
};

export type BeadColor = {
  id: string;
  name: string;
  colorCode: string;
  hex: string;
  rgb: [number, number, number];
  symbol: string;
};

export type MaterialItem = {
  colorId: string;
  colorName: string;
  colorCode: string;
  hex: string;
  requiredCount: number;
  recommendedCount: number;
  spareCount: number;
  spareRate: number;
  alternativeColors: BeadColor[];
};

export type PatternCell = {
  x: number;
  y: number;
  colorId: string;
  colorCode: string;
  hex: string;
  symbol: string;
  isTransparent?: boolean;
};

export type GeneratedPattern = {
  id?: string;
  width: number;
  height: number;
  totalBeads: number;
  colorCount: number;
  cells: PatternCell[][];
  colors: BeadColor[];
  materials: MaterialItem[];
  previewImageUrl?: string;
  createdAt?: string;
};

export type ProjectStatus = "draft" | "generated" | "exported";

export type Project = {
  id: string;
  userId?: string;
  title: string;
  sourceImageUrl?: string;
  croppedImageUrl?: string;
  coverImageUrl?: string;
  config: PatternConfig;
  pattern?: GeneratedPattern;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
};
