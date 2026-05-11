"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, ClipboardList, Download, Eye, Palette, Share2 } from "lucide-react";
import { PatternPreviewCanvas } from "@/components/pattern/PatternPreviewCanvas";
import { WorkflowSteps } from "@/components/shared/WorkflowSteps";
import { usePatternStore } from "@/stores/pattern-store";

export default function PreviewPage() {
  const { croppedImageUrl, sourceImageUrl, generatedPattern } = usePatternStore();
  const originalImage = croppedImageUrl || sourceImageUrl;

  if (!generatedPattern) {
    return (
      <div className="space-y-5 lg:space-y-6">
        <WorkflowSteps current={5} completed={[1, 2, 3, 4]} />
        <section className="cream-card flex min-h-[420px] flex-col items-center justify-center rounded-4xl p-6 text-center">
          <h1 className="text-2xl font-black text-bean-ink">还没有生成图纸</h1>
          <p className="mt-2 text-sm text-bean-muted">请先完成生成步骤，再查看预览。</p>
          <Link className="primary-button mt-6" href="/workspace/generating">
            返回生成
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-5 lg:space-y-6">
      <WorkflowSteps current={5} completed={[1, 2, 3, 4]} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-bean-ink">图纸预览 / 明细图纸</h1>
          <p className="mt-1 text-sm text-bean-muted">查看原图与拼豆效果对比，继续进入详细网格或材料推荐。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className="ghost-button" href="/workspace/generating">
            <ArrowLeft className="h-5 w-5" />
            返回生成
          </Link>
          <Link className="primary-button" href="/workspace/detail">
            <Eye className="h-5 w-5" />
            查看明细
          </Link>
        </div>
      </div>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="cream-card rounded-4xl p-5">
              <div className="mb-4 flex items-center gap-2 font-black text-bean-ink">
                <Eye className="h-5 w-5 text-milk-purple" />
                原图
              </div>
              <div className="flex min-h-[320px] items-center justify-center overflow-hidden rounded-3xl bg-milk-purple-soft/30 p-3">
                {originalImage ? <img alt="原图" className="max-h-[460px] w-full rounded-2xl object-contain" src={originalImage} /> : null}
              </div>
            </div>
            <div className="cream-card rounded-4xl p-5">
              <div className="mb-4 flex items-center gap-2 font-black text-bean-ink">
                <Palette className="h-5 w-5 text-milk-purple" />
                拼豆效果图
              </div>
              <div className="flex min-h-[320px] items-center justify-center overflow-auto rounded-3xl bg-cream p-3">
                <PatternPreviewCanvas pattern={generatedPattern} />
              </div>
            </div>
          </div>

          <div className="cream-card rounded-4xl p-5 md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <ClipboardList className="h-6 w-6 text-milk-purple" />
              <h2 className="text-xl font-black text-bean-ink">图纸统计</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              <Stat label="图纸尺寸" value={`${generatedPattern.width} x ${generatedPattern.height}`} />
              <Stat label="总颗数" value={`${generatedPattern.totalBeads.toLocaleString()} 颗`} />
              <Stat label="使用颜色" value={`${generatedPattern.colorCount} 色`} />
              <Stat label="材料项" value={`${generatedPattern.materials.length} 项`} />
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="cream-card rounded-4xl p-5">
            <h2 className="mb-4 text-xl font-black text-bean-ink">使用配色</h2>
            <div className="flex flex-wrap gap-2">
              {generatedPattern.colors.map((color) => (
                <span key={color.id} className="h-8 w-8 rounded-full border border-bean-border shadow-insetSoft" style={{ backgroundColor: color.hex }} title={`${color.colorCode} ${color.name}`} />
              ))}
            </div>
          </div>

          <div className="cream-card rounded-4xl p-5">
            <h2 className="mb-4 text-xl font-black text-bean-ink">下一步</h2>
            <div className="space-y-3">
              <Link className="ghost-button w-full justify-between" href="/workspace/detail">
                查看完整明细
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link className="ghost-button w-full justify-between" href="/workspace/export">
                <Download className="h-5 w-5" />
                材料推荐 / 导出
              </Link>
              <button className="ghost-button w-full justify-between" type="button">
                <Share2 className="h-5 w-5" />
                分享链接
              </button>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-bean-border bg-milk-purple-soft/40 p-4 text-center">
      <p className="text-sm text-bean-muted">{label}</p>
      <p className="mt-1 text-lg font-black text-bean-ink">{value}</p>
    </div>
  );
}
