"use client";

import { Grid3X3, Layers3, Palette, SlidersHorizontal } from "lucide-react";
import {
  deriveGridFromColumns,
  deriveGridFromTargetBeadCount,
  getColorMergeLabel,
  getColorMergeMode,
  PATTERN_LIMITS
} from "@/lib/pattern/grid";
import type { PatternConfig } from "@/types/pattern";

type PatternControlSlidersProps = {
  config: PatternConfig;
  onChange: (partial: Partial<PatternConfig>) => void;
  title?: string;
  description?: string;
};

export function PatternControlSliders({
  config,
  onChange,
  title = "精细参数轴",
  description = "提高豆数、横轴切割和色彩保真度，可以处理更复杂的照片。"
}: PatternControlSlidersProps) {
  function updateTargetBeadCount(targetBeadCount: number) {
    const grid = deriveGridFromTargetBeadCount(targetBeadCount, config.aspectRatio);
    onChange({
      finishedSize: "custom",
      ...grid
    });
  }

  function updateCanvasColumns(canvasColumns: number) {
    const grid = deriveGridFromColumns(canvasColumns, config.aspectRatio);
    onChange({
      finishedSize: "custom",
      ...grid
    });
  }

  function updateMergeStrength(value: number) {
    onChange({
      aiColorReduce: true,
      colorMergeStrength: value,
      colorMergeMode: getColorMergeMode(value)
    });
  }

  return (
    <div className="rounded-3xl border border-bean-border bg-white/82 p-4 shadow-insetSoft">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-milk-purple-soft text-milk-purple">
          <SlidersHorizontal className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-black text-bean-ink">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-bean-muted">{description}</p>
        </div>
      </div>

      <div className="space-y-4">
        <SliderRow
          icon={<Layers3 className="h-5 w-5" />}
          label="豆子数量"
          max={PATTERN_LIMITS.targetBeadCount.max}
          min={PATTERN_LIMITS.targetBeadCount.min}
          step={PATTERN_LIMITS.targetBeadCount.step}
          value={config.targetBeadCount}
          valueLabel={`${config.targetBeadCount.toLocaleString()} 颗`}
          onChange={updateTargetBeadCount}
        />
        <SliderRow
          icon={<Grid3X3 className="h-5 w-5" />}
          label="横轴切割数量"
          max={PATTERN_LIMITS.canvasColumns.max}
          min={PATTERN_LIMITS.canvasColumns.min}
          step={PATTERN_LIMITS.canvasColumns.step}
          value={config.gridWidth}
          valueLabel={`${config.gridWidth} 列`}
          onChange={updateCanvasColumns}
        />
        <SliderRow
          icon={<Palette className="h-5 w-5" />}
          label="可用颜色上限"
          max={PATTERN_LIMITS.colorCount.max}
          min={PATTERN_LIMITS.colorCount.min}
          step={PATTERN_LIMITS.colorCount.step}
          value={config.colorCount}
          valueLabel={`${config.colorCount} 色`}
          onChange={(value) => onChange({ colorCount: value })}
        />
        <SliderRow
          icon={<SlidersHorizontal className="h-5 w-5" />}
          label="颜色合并模式"
          max={PATTERN_LIMITS.colorMergeStrength.max}
          min={PATTERN_LIMITS.colorMergeStrength.min}
          step={PATTERN_LIMITS.colorMergeStrength.step}
          value={config.colorMergeStrength}
          valueLabel={`${getColorMergeLabel(config.colorMergeStrength)} ${config.colorMergeStrength}%`}
          onChange={updateMergeStrength}
        />
      </div>

      <div className="mt-4 grid gap-3 text-center text-sm sm:grid-cols-4">
        <Summary label="图纸尺寸" value={`${config.gridWidth} x ${config.gridHeight}`} />
        <Summary label="预计豆数" value={`${(config.gridWidth * config.gridHeight).toLocaleString()} 颗`} />
        <Summary label="画面比例" value={`${config.aspectRatio.toFixed(2)} : 1`} />
        <Summary label="合并策略" value={getColorMergeLabel(config.colorMergeStrength)} />
      </div>
    </div>
  );
}

function SliderRow({
  icon,
  label,
  max,
  min,
  onChange,
  step,
  value,
  valueLabel
}: {
  icon: React.ReactNode;
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step: number;
  value: number;
  valueLabel: string;
}) {
  return (
    <label className="block rounded-2xl border border-bean-border bg-milk-purple-soft/30 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 font-black text-bean-ink">
          <span className="text-milk-purple">{icon}</span>
          {label}
        </span>
        <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-milk-purple shadow-insetSoft">
          {valueLabel}
        </span>
      </div>
      <input
        className="mt-4 h-2 w-full accent-milk-purple"
        max={max}
        min={min}
        step={step}
        type="range"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="mt-2 flex justify-between text-xs font-semibold text-bean-muted">
        <span>{min.toLocaleString()}</span>
        <span>{max.toLocaleString()}</span>
      </div>
    </label>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/80 p-3">
      <p className="text-bean-muted">{label}</p>
      <p className="mt-1 font-black text-bean-ink">{value}</p>
    </div>
  );
}
