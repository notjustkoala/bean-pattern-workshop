import type { BeadColor, GeneratedPattern, PatternConfig } from "@/types/pattern";

export type PatternWorkerRequest = {
  type: "generate";
  payload: {
    imageUrl: string;
    config: PatternConfig;
    palette: BeadColor[];
  };
};

export type PatternWorkerProgress = {
  type: "progress";
  progress: number;
  message: string;
};

export type PatternWorkerSuccess = {
  type: "success";
  pattern: GeneratedPattern;
};

export type PatternWorkerFailure = {
  type: "error";
  message: string;
};

export type PatternWorkerResponse = PatternWorkerProgress | PatternWorkerSuccess | PatternWorkerFailure;
