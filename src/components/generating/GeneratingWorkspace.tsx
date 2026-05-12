"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, ImagePlus, Loader2, Palette, Sparkles } from "lucide-react";
import { BeadMascot } from "@/components/shared/BeadMascot";
import { WorkflowSteps } from "@/components/shared/WorkflowSteps";
import { generatePatternWithWorker } from "@/lib/pattern/worker-client";
import { cn } from "@/lib/utils/cn";
import { usePatternStore } from "@/stores/pattern-store";

export function GeneratingWorkspace() {
  const router = useRouter();
  const hasStarted = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const {
    croppedImageUrl,
    sourceImageUrl,
    config,
    generatedPattern,
    generationProgress,
    generationMessage,
    setGeneratedPattern,
    startGenerating,
    updateGenerationProgress
  } = usePatternStore();
  const imageUrl = croppedImageUrl || sourceImageUrl;

  useEffect(() => {
    if (!imageUrl || hasStarted.current || generatedPattern) return;

    hasStarted.current = true;
    setError(null);
    startGenerating();

    generatePatternWithWorker({
      imageUrl,
      config,
      onProgress: updateGenerationProgress
    })
      .then((pattern) => {
        setGeneratedPattern(pattern);
        updateGenerationProgress(100, "图纸生成完成");
      })
      .catch((currentError) => {
        setError(currentError instanceof Error ? currentError.message : "图纸生成失败");
        updateGenerationProgress(0, "生成失败，请重试");
      });
  }, [config, generatedPattern, imageUrl, setGeneratedPattern, startGenerating, updateGenerationProgress]);

  if (!imageUrl) {
    return (
      <div className="space-y-5 lg:space-y-6">
        <WorkflowSteps current={4} completed={[1, 2, 3]} />
        <section className="cream-card flex min-h-[420px] flex-col items-center justify-center rounded-4xl p-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-milk-purple-soft text-milk-purple">
            <ImagePlus className="h-10 w-10" />
          </div>
          <h1 className="mt-5 text-2xl font-black text-bean-ink">还没有可生成的图片</h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-bean-muted">请先上传、裁剪并设置参数，再生成拼豆图纸。</p>
          <Link className="primary-button mt-6" href="/workspace/upload">
            返回上传
          </Link>
        </section>
      </div>
    );
  }

  const complete = Boolean(generatedPattern) && generationProgress >= 100;

  return (
    <div className="space-y-5 lg:space-y-6">
      <WorkflowSteps current={4} completed={[1, 2, 3]} />

      <section className="soft-panel relative overflow-hidden rounded-4xl p-6 md:p-8">
        <div className="grid items-center gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.65fr)]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-milk-purple shadow-insetSoft">
              {complete ? <CheckCircle2 className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />}
              {complete ? "图纸生成完成" : "AI 正在处理图片"}
            </div>
            <h1 className="text-3xl font-black text-bean-ink md:text-5xl">
              {complete ? "拼豆图纸已准备好" : "正在生成专属拼豆图纸"}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-bean-muted">
              {complete
                ? "已完成高精度采样、Lab 感知色彩匹配、颜色合并和材料推荐。"
                : "Worker 正在后台处理图片，页面会保持响应。"}
            </p>

            <div className="mt-7 rounded-3xl border border-bean-border bg-white/86 p-4 shadow-insetSoft">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-black text-bean-ink">{generationMessage || "准备中"}</span>
                <span className="text-2xl font-black text-milk-purple">{Math.round(generationProgress)}%</span>
              </div>
              <div className="mt-3 h-4 overflow-hidden rounded-full bg-milk-purple-soft">
                <div
                  className="h-full rounded-full bg-purple-button transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, generationProgress))}%` }}
                />
              </div>
            </div>

            {error ? (
              <div className="mt-5 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-bean-danger">
                {error}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button className="ghost-button" type="button" onClick={() => router.push("/workspace/params")}>
                <ArrowLeft className="h-5 w-5" />
                返回参数设置
              </button>
              <button
                className={cn("primary-button", !complete && "cursor-not-allowed opacity-60")}
                disabled={!complete}
                type="button"
                onClick={() => router.push("/workspace/preview")}
              >
                查看图纸预览
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <BeadMascot size="lg" withBoard />
          </div>
        </div>
      </section>

      {generatedPattern ? (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.65fr)]">
          <div className="cream-card rounded-4xl p-5 md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-milk-purple-soft text-milk-purple">
                <Palette className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-bean-ink">生成结果摘要</h2>
                <p className="text-sm text-bean-muted">网格、颜色和材料统计已生成</p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <SummaryItem label="图纸尺寸" value={`${generatedPattern.width} x ${generatedPattern.height}`} />
              <SummaryItem label="总颗数" value={`${generatedPattern.totalBeads.toLocaleString()} 颗`} />
              <SummaryItem label="实际用色" value={`${generatedPattern.colorCount} 色`} />
            </div>
          </div>

          <div className="cream-card rounded-4xl p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-xl font-black text-bean-ink">材料推荐 Top</h2>
              <Sparkles className="h-5 w-5 text-milk-purple" />
            </div>
            <div className="space-y-3">
              {generatedPattern.materials.slice(0, 5).map((item) => (
                <div key={item.colorId} className="flex items-center justify-between rounded-2xl border border-bean-border bg-white/86 p-3">
                  <div className="flex items-center gap-3">
                    <span className="h-7 w-7 rounded-full border border-bean-border" style={{ backgroundColor: item.hex }} />
                    <div>
                      <p className="font-black text-bean-ink">{item.colorName}</p>
                      <p className="text-xs text-bean-muted">{item.colorCode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-milk-purple">{item.recommendedCount} 颗</p>
                    <p className="text-xs text-bean-muted">含备用 {item.spareCount}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-bean-border bg-gradient-to-br from-white to-milk-purple-soft/45 p-4">
      <p className="text-sm text-bean-muted">{label}</p>
      <p className="mt-2 text-2xl font-black text-bean-ink">{value}</p>
    </div>
  );
}

