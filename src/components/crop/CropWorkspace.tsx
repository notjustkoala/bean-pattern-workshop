"use client";

import { useCallback, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { ArrowLeft, ArrowRight, ImagePlus, RotateCcw, RotateCw, Sparkles, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import { BeadMascot } from "@/components/shared/BeadMascot";
import { WorkflowSteps } from "@/components/shared/WorkflowSteps";
import { getCroppedImage } from "@/lib/image/crop";
import { deriveGridFromTargetBeadCount, normalizeAspectRatio } from "@/lib/pattern/grid";
import { cn } from "@/lib/utils/cn";
import { usePatternStore } from "@/stores/pattern-store";

const ratioOptions = [
  { label: "1:1", detail: "正方形", value: 1 },
  { label: "3:4", detail: "竖版", value: 3 / 4 },
  { label: "4:3", detail: "横版", value: 4 / 3 },
  { label: "16:9", detail: "宽屏", value: 16 / 9 }
];

export function CropWorkspace() {
  const router = useRouter();
  const { sourceImageUrl, sourceImageMeta, croppedImageUrl, config, setCroppedImageUrl, updateConfig } = usePatternStore();
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedRatio = useMemo(
    () => ratioOptions.find((ratio) => Math.abs(ratio.value - aspect) < 0.001)?.label ?? "自定义",
    [aspect]
  );

  const onCropComplete = useCallback((_croppedArea: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  async function handleNext() {
    if (!sourceImageUrl || !croppedAreaPixels) return;

    try {
      setError(null);
      setIsSaving(true);
      const cropped = await getCroppedImage(sourceImageUrl, croppedAreaPixels, rotation);
      const aspectRatio = normalizeAspectRatio(croppedAreaPixels.width / croppedAreaPixels.height);
      const grid = deriveGridFromTargetBeadCount(config.targetBeadCount, aspectRatio);
      setCroppedImageUrl(cropped);
      updateConfig({
        ...grid,
        aspectRatio
      });
      router.push("/workspace/params");
    } catch {
      setError("裁剪失败，请换一张图片或重新调整裁剪框");
    } finally {
      setIsSaving(false);
    }
  }

  function resetCrop() {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setAspect(1);
  }

  if (!sourceImageUrl) {
    return (
      <div className="space-y-5">
        <WorkflowSteps current={2} />
        <section className="cream-card flex min-h-[420px] flex-col items-center justify-center rounded-4xl p-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-milk-purple-soft text-milk-purple">
            <ImagePlus className="h-10 w-10" />
          </div>
          <h1 className="mt-5 text-2xl font-black text-bean-ink">还没有可裁剪的图片</h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-bean-muted">请先上传图片或选择示例图，再进入裁剪调整。</p>
          <button className="primary-button mt-6" type="button" onClick={() => router.push("/workspace/upload")}>
            返回上传
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-5 lg:space-y-6">
      <WorkflowSteps current={2} completed={[1]} />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.75fr)]">
        <div className="cream-card rounded-4xl p-4 md:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black text-bean-ink">裁剪与调整</h1>
              <p className="mt-1 text-sm text-bean-muted">拖动或缩放裁剪框，选择你想要的主体区域</p>
            </div>
            <div className="rounded-2xl bg-milk-purple-soft px-4 py-2 text-sm font-black text-milk-purple">
              {sourceImageMeta?.name ?? "当前图片"}
            </div>
          </div>

          <div className="relative h-[420px] overflow-hidden rounded-3xl bg-[#242232] shadow-insetSoft md:h-[560px]">
            <Cropper
              image={sourceImageUrl}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              cropShape="rect"
              showGrid
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
            />
            <div className="pointer-events-none absolute left-4 top-4 rounded-2xl bg-bean-ink/70 px-3 py-2 text-xs font-black text-white">
              {selectedRatio} · {Math.round(zoom * 100)}%
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
            <div className="flex items-center gap-3 rounded-2xl border border-bean-border bg-white px-4 py-3">
              <ZoomOut className="h-5 w-5 text-bean-muted" />
              <input
                aria-label="缩放"
                className="h-2 flex-1 accent-milk-purple"
                max={3}
                min={1}
                step={0.01}
                type="range"
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
              />
              <ZoomIn className="h-5 w-5 text-milk-purple" />
            </div>
            <button className="ghost-button px-4" type="button" onClick={() => setRotation((value) => value - 90)}>
              <RotateCcw className="h-5 w-5" />
              左转
            </button>
            <button className="ghost-button px-4" type="button" onClick={() => setRotation((value) => value + 90)}>
              <RotateCw className="h-5 w-5" />
              右转
            </button>
          </div>

          <div className="mt-5">
            <p className="mb-3 text-sm font-black text-bean-ink">选择比例</p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {ratioOptions.map((ratio) => (
                <button
                  key={ratio.label}
                  className={cn(
                    "rounded-2xl border p-4 text-center transition",
                    Math.abs(ratio.value - aspect) < 0.001
                      ? "border-milk-purple bg-milk-purple-soft text-milk-purple shadow-insetSoft"
                      : "border-bean-border bg-white text-bean-ink hover:border-milk-purple-light"
                  )}
                  type="button"
                  onClick={() => setAspect(ratio.value)}
                >
                  <span className="block text-xl font-black">{ratio.label}</span>
                  <span className="mt-1 block text-xs font-semibold text-bean-muted">{ratio.detail}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="soft-panel rounded-4xl p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-milk-purple shadow-insetSoft">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-black text-bean-ink">AI 构图建议</h2>
                <p className="text-sm text-bean-muted">尽量让主体居中，背景留白适中</p>
              </div>
            </div>
            <div className="mt-5 overflow-hidden rounded-3xl border border-bean-border bg-white/80 p-3">
              <img
                alt="裁剪预览"
                className="aspect-square w-full rounded-2xl object-cover"
                src={croppedImageUrl || sourceImageUrl}
              />
            </div>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-bean-muted">
              <li>· 主体越完整，生成图纸越容易保留神态</li>
              <li>· 正方形比例适合头像和小摆件</li>
              <li>· 横版比例适合风景或长条装饰</li>
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-4xl border border-bean-border bg-gradient-to-br from-milk-purple-soft via-white to-cream-2 p-5 shadow-soft">
            <div className="relative z-10 max-w-[220px]">
              <p className="text-lg font-black text-bean-ink">建议保留主体完整</p>
              <p className="mt-2 text-sm leading-6 text-bean-muted">裁剪时尽量不要切到耳朵、爪子或关键边缘。</p>
            </div>
            <div className="mt-5 flex justify-end">
              <BeadMascot size="md" />
            </div>
            <span className="bead-sparkle right-6 top-7 h-4 w-4" style={{ "--bead-color": "#FBBF24" } as CSSProperties} />
          </div>
        </aside>
      </section>

      <section className="cream-card sticky bottom-24 z-20 flex flex-col gap-3 rounded-3xl p-4 md:flex-row md:items-center md:justify-between lg:bottom-4">
        <button className="ghost-button md:w-48" type="button" onClick={() => router.push("/workspace/upload")}>
          <ArrowLeft className="h-5 w-5" />
          上一步
        </button>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button className="ghost-button md:w-40" type="button" onClick={resetCrop}>
            <Undo2 className="h-5 w-5" />
            重置
          </button>
          <button className="primary-button md:w-56" disabled={isSaving} type="button" onClick={handleNext}>
            {isSaving ? "处理中..." : "下一步"}
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
        {error ? <p className="text-sm font-semibold text-bean-danger md:absolute md:left-1/2 md:-translate-x-1/2">{error}</p> : null}
      </section>
    </div>
  );
}
