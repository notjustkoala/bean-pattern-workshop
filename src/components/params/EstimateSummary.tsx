import { Clock3, Grid3X3, Palette, Sparkles } from "lucide-react";
import { getColorMergeLabel } from "@/lib/pattern/grid";
import type { PatternConfig } from "@/types/pattern";

type EstimateSummaryProps = {
  config: PatternConfig;
};

function getDifficultyFactor(config: PatternConfig) {
  if (config.difficulty === "easy") return 0.78;
  if (config.difficulty === "detailed") return 1;
  return 0.9;
}

export function getPatternEstimate(config: PatternConfig) {
  const totalCells = config.gridWidth * config.gridHeight;
  const totalBeads = Math.round(totalCells * getDifficultyFactor(config));
  const hours = Math.max(0.5, totalBeads / 1800);

  return {
    totalBeads,
    colorCount: config.colorCount,
    colorMergeLabel: getColorMergeLabel(config.colorMergeStrength),
    hours,
    gridLabel: `${config.gridWidth} x ${config.gridHeight}`
  };
}

export function EstimateSummary({ config }: EstimateSummaryProps) {
  const estimate = getPatternEstimate(config);
  const items = [
    {
      icon: Grid3X3,
      label: "预计颗数",
      value: `${estimate.totalBeads.toLocaleString()} 颗`,
      hint: config.difficulty === "easy" ? "颗少，拼装更轻松" : "细节更完整"
    },
    {
      icon: Palette,
      label: "预计用色",
      value: `${estimate.colorCount} 色`,
      hint: config.colorCount <= 48 ? "平衡配色" : "复杂图片更友好"
    },
    {
      icon: Sparkles,
      label: "颜色合并",
      value: estimate.colorMergeLabel,
      hint: config.colorMergeStrength <= 24 ? "优先保留细节" : "减少相近色干扰"
    },
    {
      icon: Clock3,
      label: "预计耗时",
      value: `${estimate.hours.toFixed(1)} 小时`,
      hint: estimate.hours > 2 ? "适合慢慢完成" : "轻松完成"
    }
  ];

  return (
    <div className="rounded-3xl border border-bean-border bg-white/82 p-4 shadow-insetSoft">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-milk-purple" />
        <h2 className="font-black text-bean-ink">智能预估</h2>
        <span className="text-sm text-bean-muted">基于当前参数</span>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="rounded-2xl border border-bean-border bg-gradient-to-br from-white to-milk-purple-soft/45 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-milk-purple-soft text-milk-purple">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-bean-muted">{item.label}</p>
                  <p className="text-xl font-black text-bean-ink">{item.value}</p>
                </div>
              </div>
              <p className="mt-3 text-sm font-semibold text-bean-success">{item.hint}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
