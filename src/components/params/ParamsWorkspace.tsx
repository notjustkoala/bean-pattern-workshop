"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ImagePlus, SlidersHorizontal, Sparkles } from "lucide-react";
import { BeadMascot } from "@/components/shared/BeadMascot";
import { WorkflowSteps } from "@/components/shared/WorkflowSteps";
import { BACKGROUND_OPTIONS, COLOR_OPTIONS, DIFFICULTY_OPTIONS, SIZE_OPTIONS } from "@/lib/constants/params";
import { deriveGridFromTargetBeadCount, getColorMergeMode } from "@/lib/pattern/grid";
import { cn } from "@/lib/utils/cn";
import { usePatternStore } from "@/stores/pattern-store";
import type { BeadSize, ImageSourceMode } from "@/types/pattern";
import { EstimateSummary, getPatternEstimate } from "./EstimateSummary";
import { ParamOptionCard } from "./ParamOptionCard";
import { PatternControlSliders } from "./PatternControlSliders";

const beadSizeOptions: Array<{ value: BeadSize; label: string; hint: string }> = [
  { value: "2.6mm", label: "2.6mm 迷你豆", hint: "更精细" },
  { value: "5mm", label: "5mm 标准豆", hint: "推荐" }
];

const imageModeOptions: Array<{ value: ImageSourceMode; label: string; hint: string; badge?: string }> = [
  { value: "realistic", label: "真实图片", hint: "风景、人像、宠物", badge: "默认" },
  { value: "cartoon", label: "Q版 / 像素图", hint: "线条、小图、卡通人物", badge: "细节保真" }
];

export function ParamsWorkspace() {
  const router = useRouter();
  const {
    sourceImageUrl,
    croppedImageUrl,
    config,
    updateConfig,
    startGenerating
  } = usePatternStore();
  const previewImage = croppedImageUrl || sourceImageUrl;
  const estimate = getPatternEstimate(config);

  function updateSize(option: (typeof SIZE_OPTIONS)[number]) {
    const grid = deriveGridFromTargetBeadCount(option.grid[0] * option.grid[1], config.aspectRatio);

    updateConfig({
      finishedSize: option.value,
      ...grid
    });
  }

  function updateImageMode(imageMode: ImageSourceMode) {
    if (imageMode === "cartoon") {
      updateConfig({
        imageMode,
        aiColorReduce: true,
        colorCount: 221,
        colorMergeStrength: 0,
        colorMergeMode: getColorMergeMode(0),
        difficulty: "detailed"
      });
      return;
    }

    updateConfig({
      imageMode,
      difficulty: config.difficulty === "detailed" ? "standard" : config.difficulty
    });
  }

  function handleGenerate() {
    startGenerating();
    router.push("/workspace/generating");
  }

  if (!previewImage) {
    return (
      <div className="space-y-5">
        <WorkflowSteps current={3} />
        <section className="cream-card flex min-h-[420px] flex-col items-center justify-center rounded-4xl p-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-milk-purple-soft text-milk-purple">
            <ImagePlus className="h-10 w-10" />
          </div>
          <h1 className="mt-5 text-2xl font-black text-bean-ink">还没有可设置参数的图片</h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-bean-muted">请先上传并裁剪图片，再设置拼豆图纸参数。</p>
          <button className="primary-button mt-6" type="button" onClick={() => router.push("/workspace/upload")}>
            返回上传
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-5 lg:space-y-6">
      <WorkflowSteps current={3} completed={[1, 2]} />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <div className="cream-card rounded-4xl p-4 md:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-bean-ink">参数设置</h1>
                <p className="mt-1 text-sm text-bean-muted">自定义尺寸、颜色和难度，生成专属拼豆图纸</p>
              </div>
              <div className="hidden rounded-2xl bg-milk-purple-soft px-4 py-2 text-sm font-black text-milk-purple sm:block">
                {estimate.gridLabel}
              </div>
            </div>

            <div className="space-y-6">
              <ParamSection icon={<Sparkles className="h-5 w-5" />} title="图像类型">
                <div className="grid gap-3 md:grid-cols-2">
                  {imageModeOptions.map((option) => (
                    <ParamOptionCard
                      key={option.value}
                      active={config.imageMode === option.value}
                      badge={option.badge}
                      hint={option.hint}
                      label={option.label}
                      onClick={() => updateImageMode(option.value)}
                    />
                  ))}
                </div>
              </ParamSection>

              <ParamSection icon={<SlidersHorizontal className="h-5 w-5" />} title="成品大小">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {SIZE_OPTIONS.map((option) => (
                    <ParamOptionCard
                      key={option.value}
                      active={config.finishedSize === option.value}
                      badge={option.value === "medium" ? "推荐" : undefined}
                      hint={option.detail}
                      label={option.label}
                      onClick={() => updateSize(option)}
                    />
                  ))}
                </div>
              </ParamSection>

              <ParamSection title="拼豆规格">
                <div className="grid gap-3 md:grid-cols-2">
                  {beadSizeOptions.map((option) => (
                    <ParamOptionCard
                      key={option.value}
                      active={config.beadSize === option.value}
                      badge={option.value === "5mm" ? "推荐" : undefined}
                      hint={option.hint}
                      label={option.label}
                      onClick={() => updateConfig({ beadSize: option.value })}
                    />
                  ))}
                </div>
              </ParamSection>

              <ParamSection title="颜色数量">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {COLOR_OPTIONS.map((option) => (
                    <ParamOptionCard
                      key={option.value}
                      active={config.colorCount === option.value}
                      badge={option.value === 221 ? "Mard 全色" : undefined}
                      hint={option.hint}
                      label={option.label}
                      onClick={() => updateConfig({ colorCount: option.value })}
                    />
                  ))}
                </div>
              </ParamSection>

              <ParamSection title="难度等级">
                <div className="grid gap-3 md:grid-cols-3">
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <ParamOptionCard
                      key={option.value}
                      active={config.difficulty === option.value}
                      badge={option.value === "easy" ? "新手友好" : option.value === "standard" ? "平衡推荐" : undefined}
                      hint={option.hint}
                      label={option.label}
                      onClick={() => updateConfig({ difficulty: option.value })}
                    />
                  ))}
                </div>
              </ParamSection>

              <ParamSection title="背景处理">
                <div className="grid gap-3 md:grid-cols-3">
                  {BACKGROUND_OPTIONS.map((option) => (
                    <ParamOptionCard
                      key={option.value}
                      active={config.backgroundMode === option.value}
                      hint={option.hint}
                      label={option.label}
                      onClick={() => updateConfig({ backgroundMode: option.value })}
                    />
                  ))}
                </div>
              </ParamSection>

              <div className="flex items-center justify-between rounded-3xl border border-bean-border bg-milk-purple-soft/40 p-4">
                <div>
                  <p className="font-black text-bean-ink">AI 自动减色</p>
                  <p className="mt-1 text-sm text-bean-muted">智能优化颜色，减少相近色干扰</p>
                </div>
                <button
                  aria-pressed={config.aiColorReduce}
                  className={cn(
                    "relative h-8 w-14 rounded-full transition",
                    config.aiColorReduce ? "bg-purple-button" : "bg-bean-border"
                  )}
                  type="button"
                  onClick={() => updateConfig({ aiColorReduce: !config.aiColorReduce })}
                >
                  <span
                    className={cn(
                      "absolute top-1 h-6 w-6 rounded-full bg-white shadow transition",
                      config.aiColorReduce ? "left-7" : "left-1"
                    )}
                  />
                </button>
              </div>

              <PatternControlSliders
                config={config}
                description="拖动豆子数量、横轴切割和颜色合并模式，复杂图片可以拉高豆数与颜色上限。"
                onChange={updateConfig}
              />
            </div>
          </div>

          <EstimateSummary config={config} />
        </div>

        <aside className="space-y-5">
          <div className="cream-card rounded-4xl p-5">
            <div className="overflow-hidden rounded-3xl border border-bean-border bg-milk-purple-soft/30 p-3">
              <img alt="目标图片预览" className="aspect-square w-full rounded-2xl object-cover" src={previewImage} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center text-sm">
              <div className="rounded-2xl bg-milk-purple-soft/50 p-3">
                <p className="text-bean-muted">图纸尺寸</p>
                <p className="mt-1 font-black text-bean-ink">{estimate.gridLabel}</p>
              </div>
              <div className="rounded-2xl bg-milk-purple-soft/50 p-3">
                <p className="text-bean-muted">预计材料</p>
                <p className="mt-1 font-black text-bean-ink">{estimate.totalBeads.toLocaleString()} 颗</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-4xl border border-bean-border bg-gradient-to-br from-milk-purple-soft via-white to-cream-2 p-5 shadow-soft">
            <div className="relative z-10 max-w-[220px]">
              <p className="text-lg font-black text-bean-ink">小贴士</p>
              <p className="mt-2 text-sm leading-6 text-bean-muted">卡通人物、像素图和线稿建议选择 Q版 / 像素图，线条和小色块会更清晰。</p>
            </div>
            <div className="mt-5 flex justify-end">
              <BeadMascot size="md" />
            </div>
          </div>
        </aside>
      </section>

      <section className="cream-card sticky bottom-24 z-20 flex flex-col gap-3 rounded-3xl p-4 md:flex-row md:items-center md:justify-between lg:bottom-4">
        <button className="ghost-button md:w-48" type="button" onClick={() => router.push("/workspace/crop")}>
          <ArrowLeft className="h-5 w-5" />
          上一步
        </button>
        <button className="primary-button md:w-56" type="button" onClick={handleGenerate}>
          <Sparkles className="h-5 w-5" />
          生成图纸
          <ArrowRight className="h-5 w-5" />
        </button>
      </section>
    </div>
  );
}

function ParamSection({
  children,
  icon,
  title
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  title: string;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-milk-purple-soft text-milk-purple">
          {icon ?? <SlidersHorizontal className="h-5 w-5" />}
        </div>
        <h2 className="font-black text-bean-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}
