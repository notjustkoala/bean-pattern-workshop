"use client";

import { Download, FileImage, FileText, Link as LinkIcon, Loader2, Printer, Save } from "lucide-react";
import { downloadPatternPdf, downloadPatternPng } from "@/lib/pattern/export-image";
import type { GeneratedPattern } from "@/types/pattern";

export function ExportPanel({
  pattern,
  onSaveProject,
  isSaving = false
}: {
  pattern: GeneratedPattern;
  onSaveProject?: () => void;
  isSaving?: boolean;
}) {
  function copyShareText() {
    void navigator.clipboard?.writeText(`豆图工坊图纸：${pattern.width}x${pattern.height}，${pattern.totalBeads} 颗，${pattern.colorCount} 色`);
  }

  return (
    <div className="cream-card rounded-4xl p-5">
      <div className="mb-4 flex items-center gap-3">
        <Download className="h-6 w-6 text-milk-purple" />
        <h2 className="text-xl font-black text-bean-ink">导出 / 打印</h2>
      </div>
      <div className="space-y-3">
        {onSaveProject ? (
          <button className="ghost-button w-full justify-between disabled:cursor-not-allowed disabled:opacity-60" disabled={isSaving} type="button" onClick={onSaveProject}>
            <span className="inline-flex items-center gap-2">
              {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {isSaving ? "保存中" : "保存项目"}
            </span>
            <Save className="h-5 w-5" />
          </button>
        ) : null}
        <button className="primary-button w-full justify-between" type="button" onClick={() => downloadPatternPdf(pattern)}>
          <span className="inline-flex items-center gap-2"><FileText className="h-5 w-5" />导出 PDF</span>
          <Download className="h-5 w-5" />
        </button>
        <button className="ghost-button w-full justify-between" type="button" onClick={() => downloadPatternPng(pattern)}>
          <span className="inline-flex items-center gap-2"><FileImage className="h-5 w-5" />导出 PNG</span>
          <Download className="h-5 w-5" />
        </button>
        <button className="ghost-button w-full justify-between" type="button" onClick={() => window.print()}>
          <span className="inline-flex items-center gap-2"><Printer className="h-5 w-5" />打印图纸</span>
          <Printer className="h-5 w-5" />
        </button>
        <button className="ghost-button w-full justify-between" type="button" onClick={copyShareText}>
          <span className="inline-flex items-center gap-2"><LinkIcon className="h-5 w-5" />复制分享信息</span>
          <LinkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
