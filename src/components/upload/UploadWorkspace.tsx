"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, FileImage, Image as ImageIcon, Trash2 } from "lucide-react";
import { ParamOptionCard } from "@/components/params/ParamOptionCard";
import { ExampleImageGrid } from "./ExampleImageGrid";
import { UploadDropzone } from "./UploadDropzone";
import { UploadTips } from "./UploadTips";
import { BeadMascot } from "@/components/shared/BeadMascot";
import { getColorMergeMode } from "@/lib/pattern/grid";
import { formatBytes } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { usePatternStore } from "@/stores/pattern-store";
import type { ImageSourceMode } from "@/types/pattern";

const steps = ["上传图片", "裁剪调整", "参数设置", "生成图纸", "图纸预览"];

const imageModeOptions: Array<{ value: ImageSourceMode; label: string; hint: string; badge?: string }> = [
  { value: "realistic", label: "真实图片", hint: "风景、人像、宠物", badge: "默认" },
  { value: "cartoon", label: "Q版 / 像素图", hint: "线条、小图、卡通人物", badge: "细节保真" }
];

export function UploadWorkspace() {
  const router = useRouter();
  const { sourceImageUrl, sourceImageMeta, clearSourceImage, config, updateConfig } = usePatternStore();

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

  return (
    <div className="space-y-5 lg:space-y-6">
      <section className="soft-panel rounded-3xl p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-3 md:justify-between">
          {steps.map((step, index) => {
            const active = index === 0;
            const completed = Boolean(sourceImageUrl) && index === 0;

            return (
              <div key={step} className="flex min-w-[120px] flex-1 items-center gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black",
                    active || completed ? "bg-purple-button text-white shadow-bead" : "bg-milk-purple-soft text-bean-muted"
                  )}
                >
                  {completed ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                </div>
                <span className={cn("text-sm font-black", active ? "text-milk-purple" : "text-bean-muted")}>
                  {step}
                </span>
                {index < steps.length - 1 ? (
                  <span className="hidden h-px flex-1 border-t border-dashed border-milk-purple-light md:block" />
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.75fr)]">
        <div className="space-y-5">
          <div className="cream-card rounded-3xl p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-2xl font-black text-bean-ink">上传图片</p>
                <p className="mt-1 text-sm text-bean-muted">拖拽上传或从本地选择一张照片</p>
              </div>
              <div className="hidden rounded-2xl bg-milk-purple-soft px-4 py-2 text-sm font-black text-milk-purple sm:block">
                JPG / PNG / WEBP
              </div>
            </div>
            <UploadDropzone />
          </div>

          <div className="cream-card rounded-3xl p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xl font-black text-bean-ink">当前图片</p>
                <p className="mt-1 text-sm text-bean-muted">上传后会保存在本地工作流状态中</p>
              </div>
              {sourceImageUrl ? (
                <button className="ghost-button px-4 py-2 text-sm" type="button" onClick={clearSourceImage}>
                  <Trash2 className="h-4 w-4" />
                  清除
                </button>
              ) : null}
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_270px]">
              <div className="flex min-h-[280px] items-center justify-center overflow-hidden rounded-3xl border border-bean-border bg-milk-purple-soft/30">
                {sourceImageUrl ? (
                  <img src={sourceImageUrl} alt={sourceImageMeta?.name ?? "已上传图片"} className="h-full max-h-[420px] w-full object-contain" />
                ) : (
                  <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-milk-purple shadow-insetSoft">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                    <p className="mt-3 font-black text-bean-ink">还没有选择图片</p>
                    <p className="mt-1 text-sm text-bean-muted">上传或选择示例图后会显示在这里</p>
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-bean-border bg-white/90 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-milk-purple-soft text-milk-purple">
                    <FileImage className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-black text-bean-ink">{sourceImageMeta?.name ?? "等待上传"}</p>
                    <p className="text-sm text-bean-muted">
                      {sourceImageMeta?.fromExample ? "示例图片" : formatBytes(sourceImageMeta?.size)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded-2xl bg-milk-purple-soft/50 px-3 py-2">
                    <span className="text-bean-muted">上传状态</span>
                    <span className={cn("font-black", sourceImageUrl ? "text-bean-success" : "text-bean-muted")}>
                      {sourceImageUrl ? "已就绪" : "未开始"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-milk-purple-soft/50 px-3 py-2">
                    <span className="text-bean-muted">推荐尺寸</span>
                    <span className="font-black text-bean-ink">中号 120 x 120</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-milk-purple-soft/50 px-3 py-2">
                    <span className="text-bean-muted">推荐颜色</span>
                    <span className="font-black text-bean-ink">Mard 221 色</span>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="mb-3 font-black text-bean-ink">图像类型</p>
                  <div className="grid gap-3">
                    {imageModeOptions.map((option) => (
                      <ParamOptionCard
                        key={option.value}
                        active={config.imageMode === option.value}
                        badge={option.badge}
                        disabled={!sourceImageUrl}
                        hint={option.hint}
                        label={option.label}
                        onClick={() => updateImageMode(option.value)}
                      />
                    ))}
                  </div>
                </div>

                <button
                  className={cn(
                    "mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-black transition",
                    sourceImageUrl
                      ? "bg-purple-button text-white shadow-bead"
                      : "cursor-not-allowed bg-bean-border/60 text-bean-muted"
                  )}
                  type="button"
                  disabled={!sourceImageUrl}
                  onClick={() => {
                    if (sourceImageUrl) {
                      router.push("/workspace/crop");
                    }
                  }}
                >
                  下一步：裁剪调整
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="cream-card overflow-hidden rounded-3xl p-4 md:p-5">
            <ExampleImageGrid />
          </div>
          <UploadTips />
          <div className="relative overflow-hidden rounded-3xl border border-bean-border bg-gradient-to-br from-milk-purple-soft via-white to-cream-2 p-5 shadow-soft">
            <div className="relative z-10 max-w-[220px]">
              <p className="text-lg font-black text-bean-ink">豆豆酱会帮你把素材整理好</p>
              <p className="mt-2 text-sm leading-6 text-bean-muted">接下来会进入裁剪、参数和图纸生成流程。</p>
            </div>
            <div className="absolute bottom-3 right-3">
              <BeadMascot size="md" />
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
