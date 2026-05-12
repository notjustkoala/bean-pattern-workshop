"use client";

import { create } from "zustand";
import type { GeneratedPattern, PatternConfig, Project } from "@/types/pattern";

type SourceImageMeta = {
  name: string;
  size?: number;
  type?: string;
  fromExample?: boolean;
};

interface PatternState {
  currentProject: Project | null;
  sourceFile: File | null;
  sourceImageUrl: string | null;
  sourceImageMeta: SourceImageMeta | null;
  croppedImageUrl: string | null;
  config: PatternConfig;
  generatedPattern: GeneratedPattern | null;
  isGenerating: boolean;
  generationProgress: number;
  generationMessage: string;
  uploadError: string | null;

  setSourceFile: (file: File) => void;
  useExampleImage: (url: string, meta: SourceImageMeta) => void;
  clearSourceImage: () => void;
  setCroppedImageUrl: (url: string) => void;
  updateConfig: (partial: Partial<PatternConfig>) => void;
  setGeneratedPattern: (pattern: GeneratedPattern) => void;
  startGenerating: () => void;
  updateGenerationProgress: (progress: number, message: string) => void;
  setUploadError: (message: string | null) => void;
  resetWorkflow: () => void;
}

const defaultConfig: PatternConfig = {
  finishedSize: "medium",
  beadSize: "5mm",
  aspectRatio: 1,
  targetBeadCount: 14400,
  gridWidth: 120,
  gridHeight: 120,
  colorCount: 221,
  colorMergeStrength: 0,
  colorMergeMode: "preserve",
  difficulty: "standard",
  backgroundMode: "simplify",
  aiColorReduce: true
};

function revokeObjectUrl(url: string | null) {
  if (typeof window !== "undefined" && url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export const usePatternStore = create<PatternState>((set) => ({
  currentProject: null,
  sourceFile: null,
  sourceImageUrl: null,
  sourceImageMeta: null,
  croppedImageUrl: null,
  config: defaultConfig,
  generatedPattern: null,
  isGenerating: false,
  generationProgress: 0,
  generationMessage: "",
  uploadError: null,

  setSourceFile: (file) =>
    set((state) => {
      revokeObjectUrl(state.sourceImageUrl);

      return {
        sourceFile: file,
        sourceImageUrl: URL.createObjectURL(file),
        sourceImageMeta: {
          name: file.name,
          size: file.size,
          type: file.type
        },
        croppedImageUrl: null,
        generatedPattern: null,
        config: { ...state.config, aspectRatio: 1 },
        uploadError: null
      };
    }),

  useExampleImage: (url, meta) =>
    set((state) => {
      revokeObjectUrl(state.sourceImageUrl);

      return {
        sourceFile: null,
        sourceImageUrl: url,
        sourceImageMeta: { ...meta, fromExample: true },
        croppedImageUrl: null,
        generatedPattern: null,
        config: { ...state.config, aspectRatio: 1 },
        uploadError: null
      };
    }),

  clearSourceImage: () =>
    set((state) => {
      revokeObjectUrl(state.sourceImageUrl);

      return {
        sourceFile: null,
        sourceImageUrl: null,
        sourceImageMeta: null,
        croppedImageUrl: null,
        generatedPattern: null,
        config: { ...state.config, aspectRatio: 1 },
        uploadError: null
      };
    }),

  setCroppedImageUrl: (url) => set({ croppedImageUrl: url }),
  updateConfig: (partial) => set((state) => ({ config: { ...state.config, ...partial } })),
  setGeneratedPattern: (pattern) => set({ generatedPattern: pattern, isGenerating: false, generationProgress: 100, generationMessage: "图纸生成完成" }),
  startGenerating: () =>
    set({
      generatedPattern: null,
      isGenerating: true,
      generationProgress: 8,
      generationMessage: "正在识别图片主体"
    }),
  updateGenerationProgress: (progress, message) =>
    set({
      generationProgress: progress,
      generationMessage: message
    }),
  setUploadError: (message) => set({ uploadError: message }),
  resetWorkflow: () =>
    set((state) => {
      revokeObjectUrl(state.sourceImageUrl);

      return {
        currentProject: null,
        sourceFile: null,
        sourceImageUrl: null,
        sourceImageMeta: null,
        croppedImageUrl: null,
        generatedPattern: null,
        isGenerating: false,
        generationProgress: 0,
        generationMessage: "",
        uploadError: null
      };
    })
}));

