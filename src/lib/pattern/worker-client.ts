import { DEFAULT_BEAD_PALETTE } from "@/lib/constants/bead-palettes";
import type { PatternWorkerRequest, PatternWorkerResponse } from "@/lib/pattern/worker-types";
import type { GeneratedPattern, PatternConfig } from "@/types/pattern";

type GeneratePatternWithWorkerOptions = {
  imageUrl: string;
  config: PatternConfig;
  onProgress?: (progress: number, message: string) => void;
};

export function generatePatternWithWorker({ imageUrl, config, onProgress }: GeneratePatternWithWorkerOptions) {
  return new Promise<GeneratedPattern>((resolve, reject) => {
    const worker = new Worker(new URL("../../workers/pattern.worker.ts", import.meta.url), {
      type: "module"
    });

    const cleanup = () => worker.terminate();

    worker.onmessage = (event: MessageEvent<PatternWorkerResponse>) => {
      const message = event.data;

      if (message.type === "progress") {
        onProgress?.(message.progress, message.message);
        return;
      }

      if (message.type === "success") {
        cleanup();
        resolve(message.pattern);
        return;
      }

      cleanup();
      reject(new Error(message.message));
    };

    worker.onerror = (error) => {
      cleanup();
      reject(new Error(error.message || "Worker 执行失败"));
    };

    const request: PatternWorkerRequest = {
      type: "generate",
      payload: {
        imageUrl,
        config,
        palette: DEFAULT_BEAD_PALETTE
      }
    };

    worker.postMessage(request);
  });
}
