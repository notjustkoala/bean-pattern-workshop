"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ClipboardList, Info, Palette } from "lucide-react";
import { ExportPanel } from "@/components/export/ExportPanel";
import { ToolSuggestions } from "@/components/export/ToolSuggestions";
import { PatternPreviewCanvas } from "@/components/pattern/PatternPreviewCanvas";
import { WorkflowSteps } from "@/components/shared/WorkflowSteps";
import { usePatternStore } from "@/stores/pattern-store";
import type { GeneratedPattern } from "@/types/pattern";

type SaveablePattern = Omit<GeneratedPattern, "cells" | "previewImageUrl">;

function createSaveablePattern(pattern: GeneratedPattern): SaveablePattern {
  return {
    id: pattern.id,
    width: pattern.width,
    height: pattern.height,
    totalBeads: pattern.totalBeads,
    colorCount: pattern.colorCount,
    colors: pattern.colors,
    materials: pattern.materials,
    createdAt: pattern.createdAt
  };
}

function getResultMessage(result: unknown) {
  if (result && typeof result === "object" && "error" in result && typeof result.error === "string") {
    return result.error;
  }

  return "保存失败，请先确认登录状态";
}

export default function ExportPage() {
  const router = useRouter();
  const { generatedPattern, config, sourceImageUrl, croppedImageUrl } = usePatternStore();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function saveProject() {
    if (!generatedPattern || isSaving) return;

    setIsSaving(true);
    setSaveMessage("正在保存...");

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `拼豆图纸 ${new Date().toLocaleDateString("zh-CN")}`,
          sourceImageUrl,
          croppedImageUrl,
          config,
          pattern: createSaveablePattern(generatedPattern),
          status: "generated"
        })
      });
      const result = (await response.json()) as unknown;
      if (response.ok) {
        router.prefetch("/projects");
        setSaveMessage("项目已保存到 Supabase，可前往我的项目查看");
      } else {
        setSaveMessage(getResultMessage(result));
      }
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "保存失败，请稍后重试");
    } finally {
      setIsSaving(false);
    }
  }

  if (!generatedPattern) {
    return (
      <div className="space-y-5 lg:space-y-6">
        <WorkflowSteps current={5} completed={[1, 2, 3, 4]} />
        <section className="cream-card flex min-h-[420px] flex-col items-center justify-center rounded-4xl p-6 text-center">
          <h1 className="text-2xl font-black text-bean-ink">还没有材料推荐</h1>
          <p className="mt-2 text-sm text-bean-muted">请先生成图纸，再查看材料推荐与导出。</p>
          <Link className="primary-button mt-6" href="/workspace/generating">
            返回生成
          </Link>
        </section>
      </div>
    );
  }

  const recommendedTotal = generatedPattern.materials.reduce((total, item) => total + item.recommendedCount, 0);

  return (
    <div className="space-y-5 lg:space-y-6">
      <WorkflowSteps current={5} completed={[1, 2, 3, 4]} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-bean-ink">材料推荐 / 导出打印</h1>
          <p className="mt-1 text-sm text-bean-muted">根据图纸统计颜色用量，导出 PDF / PNG 或直接打印。</p>
        </div>
        <Link className="ghost-button" href="/workspace/detail">
          <ArrowLeft className="h-5 w-5" />
          返回明细
        </Link>
      </div>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <div className="cream-card rounded-4xl p-5 md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <ClipboardList className="h-6 w-6 text-milk-purple" />
              <h2 className="text-xl font-black text-bean-ink">材料推荐清单</h2>
            </div>
            <div className="overflow-hidden rounded-3xl border border-bean-border bg-white">
              <div className="grid grid-cols-[64px_minmax(0,1fr)_90px_90px_90px] border-b border-bean-border bg-milk-purple-soft/50 px-4 py-3 text-sm font-black text-bean-ink max-md:hidden">
                <span>颜色</span>
                <span>色号 / 名称</span>
                <span className="text-right">需求</span>
                <span className="text-right">建议</span>
                <span className="text-right">备用</span>
              </div>
              <div className="divide-y divide-bean-border">
                {generatedPattern.materials.map((item) => (
                  <div key={item.colorId} className="grid gap-3 px-4 py-3 text-sm md:grid-cols-[64px_minmax(0,1fr)_90px_90px_90px] md:items-center">
                    <div className="flex items-center gap-3">
                      <span className="h-7 w-7 rounded-full border border-bean-border" style={{ backgroundColor: item.hex }} />
                      <span className="font-black text-bean-ink md:hidden">{item.colorCode}</span>
                    </div>
                    <div>
                      <p className="font-black text-bean-ink">{item.colorCode} {item.colorName}</p>
                      <p className="text-xs text-bean-muted">备用比例 {(item.spareRate * 100).toFixed(0)}%</p>
                    </div>
                    <p className="text-right font-semibold text-bean-muted max-md:flex max-md:justify-between"><span className="md:hidden">需求</span>{item.requiredCount}</p>
                    <p className="text-right font-black text-milk-purple max-md:flex max-md:justify-between"><span className="md:hidden">建议</span>{item.recommendedCount}</p>
                    <p className="text-right font-semibold text-bean-muted max-md:flex max-md:justify-between"><span className="md:hidden">备用</span>{item.spareCount}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="cream-card rounded-4xl p-5 md:p-6">
            <div className="mb-4 flex items-center gap-3">
              <Palette className="h-6 w-6 text-milk-purple" />
              <h2 className="text-xl font-black text-bean-ink">图纸预览</h2>
            </div>
            <div className="flex max-h-[520px] justify-center overflow-auto rounded-3xl bg-cream p-4">
              <PatternPreviewCanvas pattern={generatedPattern} showCoordinates showGrid />
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="soft-panel rounded-4xl p-5">
            <div className="mb-4 flex items-center gap-3">
              <Info className="h-6 w-6 text-milk-purple" />
              <h2 className="text-xl font-black text-bean-ink">用量总览</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center text-sm">
              <Summary label="需求总量" value={`${generatedPattern.totalBeads.toLocaleString()} 颗`} />
              <Summary label="建议总量" value={`${recommendedTotal.toLocaleString()} 颗`} highlight />
              <Summary label="颜色数量" value={`${generatedPattern.colorCount} 色`} />
              <Summary label="图纸尺寸" value={`${generatedPattern.width} x ${generatedPattern.height}`} />
            </div>
          </div>

          <ExportPanel pattern={generatedPattern} onSaveProject={saveProject} isSaving={isSaving} />
          {saveMessage ? (
            <div className="rounded-2xl bg-milk-purple-soft px-4 py-3 text-sm font-semibold text-milk-purple">
              <p>{saveMessage}</p>
              {saveMessage.includes("已保存") ? <Link className="mt-2 inline-flex underline" href="/projects">查看我的项目</Link> : null}
            </div>
          ) : null}
          <ToolSuggestions />
        </aside>
      </section>
    </div>
  );
}

function Summary({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-2xl bg-white/80 p-3">
      <p className="text-bean-muted">{label}</p>
      <p className={`mt-1 font-black ${highlight ? "text-milk-purple" : "text-bean-ink"}`}>{value}</p>
    </div>
  );
}

