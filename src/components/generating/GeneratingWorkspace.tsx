"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Download, Eye, Grid3X3, ImagePlus, Loader2, Maximize2, Palette, RefreshCw, Sparkles } from "lucide-react";
import { ParamOptionCard } from "@/components/params/ParamOptionCard";
import { PatternControlSliders } from "@/components/params/PatternControlSliders";
import { PatternPreviewCanvas } from "@/components/pattern/PatternPreviewCanvas";
import { BeadMascot } from "@/components/shared/BeadMascot";
import { WorkflowSteps } from "@/components/shared/WorkflowSteps";
import { getColorMergeMode } from "@/lib/pattern/grid";
import { generatePatternWithWorker } from "@/lib/pattern/worker-client";
import { cn } from "@/lib/utils/cn";
import { usePatternStore } from "@/stores/pattern-store";
import type { ImageSourceMode } from "@/types/pattern";

const imageModeOptions: Array<{ value: ImageSourceMode; label: string; hint: string; badge?: string }> = [
  { value: "realistic", label: "真实图片", hint: "风景、人像、宠物", badge: "默认" },
  { value: "cartoon", label: "Q版 / 像素图", hint: "线条、小图、卡通人物", badge: "细节保真" }
];

export function GeneratingWorkspace() {
  const router = useRouter();
  const hasStarted = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [draftConfig, setDraftConfig] = useState(usePatternStore.getState().config);
  const [highlightColorId, setHighlightColorId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(12);
  const [showSymbols, setShowSymbols] = useState(true);
  const {
    croppedImageUrl,
    sourceImageUrl,
    config,
    generatedPattern,
    generationProgress,
    generationMessage,
    setGeneratedPattern,
    startGenerating,
    updateConfig,
    updateGenerationProgress
  } = usePatternStore();
  const imageUrl = croppedImageUrl || sourceImageUrl;
  const selectedMaterial = useMemo(
    () => generatedPattern?.materials.find((item) => item.colorId === highlightColorId),
    [generatedPattern, highlightColorId]
  );

  useEffect(() => {
    setDraftConfig(config);
  }, [config]);

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

  function applyDraftConfig() {
    hasStarted.current = false;
    setHighlightColorId(null);
    setError(null);
    updateConfig(draftConfig);
    startGenerating();
  }

  function updateDraftImageMode(imageMode: ImageSourceMode) {
    setDraftConfig((current) => {
      if (imageMode === "cartoon") {
        return {
          ...current,
          imageMode,
          aiColorReduce: true,
          colorCount: 221,
          colorMergeStrength: 0,
          colorMergeMode: getColorMergeMode(0),
          difficulty: "detailed"
        };
      }

      return {
        ...current,
        imageMode,
        difficulty: current.difficulty === "detailed" ? "standard" : current.difficulty
      };
    });
  }

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
              >
                {complete ? "图纸已在下方展示" : "等待生成完成"}
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <BeadMascot size="lg" withBoard />
          </div>
        </div>
      </section>

      {generatedPattern ? (
        <section className="space-y-5">
          <div className="grid gap-5 md:grid-cols-3">
            <SummaryItem label="图纸尺寸" value={`${generatedPattern.width} x ${generatedPattern.height}`} />
            <SummaryItem label="总颗数" value={`${generatedPattern.totalBeads.toLocaleString()} 颗`} />
            <SummaryItem label="实际用色" value={`${generatedPattern.colorCount} 色`} />
          </div>

          <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="space-y-5">
              <div className="grid gap-5 xl:grid-cols-2">
                <div className="cream-card rounded-4xl p-5">
                  <div className="mb-4 flex items-center gap-2 font-black text-bean-ink">
                    <Eye className="h-5 w-5 text-milk-purple" />
                    原图
                  </div>
                  <div className="flex min-h-[300px] items-center justify-center overflow-hidden rounded-3xl bg-milk-purple-soft/30 p-3">
                    {imageUrl ? <img alt="原图" className="max-h-[440px] w-full rounded-2xl object-contain" src={imageUrl} /> : null}
                  </div>
                </div>

                <div className="cream-card rounded-4xl p-5">
                  <div className="mb-4 flex items-center gap-2 font-black text-bean-ink">
                    <Palette className="h-5 w-5 text-milk-purple" />
                    拼豆预览
                  </div>
                  <div className="flex min-h-[300px] items-center justify-center overflow-auto rounded-3xl bg-cream p-3">
                    <PatternPreviewCanvas pattern={generatedPattern} />
                  </div>
                </div>
              </div>

              <div className="cream-card rounded-4xl p-4 md:p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 font-black text-bean-ink">
                    <Grid3X3 className="h-5 w-5 text-milk-purple" />
                    明细图纸
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button className="ghost-button px-3 py-2 text-sm" type="button" onClick={() => setZoom((value) => Math.max(8, value - 2))}>
                      缩小
                    </button>
                    <span className="rounded-2xl bg-milk-purple-soft px-3 py-2 text-sm font-black text-milk-purple">{zoom}px</span>
                    <button className="ghost-button px-3 py-2 text-sm" type="button" onClick={() => setZoom((value) => Math.min(22, value + 2))}>
                      放大
                    </button>
                    <button className="ghost-button px-3 py-2 text-sm" type="button" onClick={() => setShowSymbols((value) => !value)}>
                      {showSymbols ? "隐藏色号" : "显示色号"}
                    </button>
                  </div>
                </div>
                <div className="max-h-[720px] overflow-auto rounded-3xl border border-bean-border bg-cream p-4">
                  <PatternPreviewCanvas
                    cellSize={zoom}
                    className="max-w-none rounded-2xl bg-cream shadow-soft"
                    highlightColorId={highlightColorId}
                    pattern={generatedPattern}
                    showCoordinates
                    showGrid
                    showSymbols={showSymbols}
                  />
                </div>
              </div>
            </div>

            <aside className="space-y-5">
              <div className="space-y-3">
                <div className="rounded-3xl border border-bean-border bg-white/82 p-4 shadow-insetSoft">
                  <div className="mb-3 flex items-center gap-2 font-black text-bean-ink">
                    <Sparkles className="h-5 w-5 text-milk-purple" />
                    图像类型
                  </div>
                  <div className="grid gap-3">
                    {imageModeOptions.map((option) => (
                      <ParamOptionCard
                        key={option.value}
                        active={draftConfig.imageMode === option.value}
                        badge={option.badge}
                        hint={option.hint}
                        label={option.label}
                        onClick={() => updateDraftImageMode(option.value)}
                      />
                    ))}
                  </div>
                </div>
                <PatternControlSliders
                  config={draftConfig}
                  description="拖动后直接在当前页重新生成，预览、明细和颜色数量会同步刷新。"
                  title="生成后编辑"
                  onChange={(partial) => setDraftConfig((current) => ({ ...current, ...partial }))}
                />
                <button className="primary-button w-full justify-between" type="button" onClick={applyDraftConfig}>
                  <span className="inline-flex items-center gap-2">
                    <RefreshCw className="h-5 w-5" />
                    应用参数并重新生成
                  </span>
                </button>
              </div>

              <div className="cream-card rounded-4xl p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 font-black text-bean-ink">
                    <Palette className="h-5 w-5 text-milk-purple" />
                    豆子颜色明细
                  </div>
                  <button className="text-sm font-black text-milk-purple" type="button" onClick={() => setHighlightColorId(null)}>
                    清除高亮
                  </button>
                </div>
                <div className="max-h-[540px] space-y-2 overflow-auto pr-1">
                  {generatedPattern.materials.map((item) => (
                    <button
                      key={item.colorId}
                      className={cn(
                        "flex w-full items-center justify-between rounded-2xl border p-3 text-left transition",
                        highlightColorId === item.colorId ? "border-milk-purple bg-milk-purple-soft" : "border-bean-border bg-white hover:border-milk-purple-light"
                      )}
                      type="button"
                      onClick={() => setHighlightColorId(item.colorId)}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="h-7 w-7 shrink-0 rounded-full border border-bean-border" style={{ backgroundColor: item.hex }} />
                        <div className="min-w-0">
                          <p className="truncate font-black text-bean-ink">
                            {item.colorCode} {item.colorName}
                          </p>
                          <p className="text-xs text-bean-muted">建议 {item.recommendedCount} 颗，备用 {item.spareCount}</p>
                        </div>
                      </div>
                      <span className="shrink-0 font-black text-milk-purple">{item.requiredCount}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="soft-panel rounded-4xl p-5">
                <div className="flex items-center gap-3">
                  <Maximize2 className="h-6 w-6 text-milk-purple" />
                  <h2 className="text-xl font-black text-bean-ink">当前查看</h2>
                </div>
                <p className="mt-3 text-sm leading-6 text-bean-muted">
                  {selectedMaterial
                    ? `正在高亮 ${selectedMaterial.colorCode} ${selectedMaterial.colorName}，共 ${selectedMaterial.requiredCount} 颗。`
                    : "从颜色明细点选任意色号，可在明细图纸里查看同色位置。"}
                </p>
                <Link className="ghost-button mt-4 w-full justify-between" href="/workspace/export">
                  <span className="inline-flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    材料推荐 / 导出
                  </span>
                </Link>
              </div>
            </aside>
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

