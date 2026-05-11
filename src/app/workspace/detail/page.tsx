"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Grid3X3, Maximize2, Palette } from "lucide-react";
import { PatternPreviewCanvas } from "@/components/pattern/PatternPreviewCanvas";
import { WorkflowSteps } from "@/components/shared/WorkflowSteps";
import { usePatternStore } from "@/stores/pattern-store";
import { cn } from "@/lib/utils/cn";

export default function DetailPage() {
  const { generatedPattern } = usePatternStore();
  const [highlightColorId, setHighlightColorId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(14);
  const [showSymbols, setShowSymbols] = useState(true);
  const selectedMaterial = useMemo(
    () => generatedPattern?.materials.find((item) => item.colorId === highlightColorId),
    [generatedPattern, highlightColorId]
  );

  if (!generatedPattern) {
    return (
      <div className="space-y-5 lg:space-y-6">
        <WorkflowSteps current={5} completed={[1, 2, 3, 4]} />
        <section className="cream-card flex min-h-[420px] flex-col items-center justify-center rounded-4xl p-6 text-center">
          <h1 className="text-2xl font-black text-bean-ink">还没有明细图纸</h1>
          <p className="mt-2 text-sm text-bean-muted">请先生成图纸，再查看完整网格。</p>
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
          <h1 className="text-3xl font-black text-bean-ink">明细图纸</h1>
          <p className="mt-1 text-sm text-bean-muted">显示坐标、网格、色号与同色高亮，方便照图拼装。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className="ghost-button" href="/workspace/preview">
            <ArrowLeft className="h-5 w-5" />
            返回预览
          </Link>
          <Link className="primary-button" href="/workspace/export">
            <Download className="h-5 w-5" />
            材料推荐
          </Link>
        </div>
      </div>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="cream-card rounded-4xl p-4 md:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-black text-bean-ink">
              <Grid3X3 className="h-5 w-5 text-milk-purple" />
              完整图纸
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button className="ghost-button px-3 py-2 text-sm" type="button" onClick={() => setZoom((value) => Math.max(8, value - 2))}>缩小</button>
              <span className="rounded-2xl bg-milk-purple-soft px-3 py-2 text-sm font-black text-milk-purple">{zoom}px</span>
              <button className="ghost-button px-3 py-2 text-sm" type="button" onClick={() => setZoom((value) => Math.min(22, value + 2))}>放大</button>
              <button className="ghost-button px-3 py-2 text-sm" type="button" onClick={() => setShowSymbols((value) => !value)}>
                {showSymbols ? "隐藏色号" : "显示色号"}
              </button>
            </div>
          </div>
          <div className="max-h-[720px] overflow-auto rounded-3xl border border-bean-border bg-cream p-4">
            <PatternPreviewCanvas
              cellSize={zoom}
              highlightColorId={highlightColorId}
              pattern={generatedPattern}
              showCoordinates
              showGrid
              showSymbols={showSymbols}
              className="max-w-none rounded-2xl bg-cream shadow-soft"
            />
          </div>
        </div>

        <aside className="space-y-5">
          <div className="cream-card rounded-4xl p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-black text-bean-ink">
                <Palette className="h-5 w-5 text-milk-purple" />
                颜色明细
              </div>
              <button className="text-sm font-black text-milk-purple" type="button" onClick={() => setHighlightColorId(null)}>清除高亮</button>
            </div>
            <div className="max-h-[530px] space-y-2 overflow-auto pr-1">
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
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-6 rounded-full border border-bean-border" style={{ backgroundColor: item.hex }} />
                    <div>
                      <p className="font-black text-bean-ink">{item.colorCode} {item.colorName}</p>
                      <p className="text-xs text-bean-muted">点击高亮同色</p>
                    </div>
                  </div>
                  <span className="font-black text-milk-purple">{item.requiredCount}</span>
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
                : "未选择高亮颜色，可以从颜色明细中点选任意色号。"}
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}

