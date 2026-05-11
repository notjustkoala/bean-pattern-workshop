"use client";

import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { EXAMPLE_IMAGES } from "@/lib/constants/examples";
import { cn } from "@/lib/utils/cn";
import { usePatternStore } from "@/stores/pattern-store";

type ExampleImageGridProps = {
  compact?: boolean;
  redirectAfterSelect?: boolean;
};

export function ExampleImageGrid({ compact = false, redirectAfterSelect = false }: ExampleImageGridProps) {
  const router = useRouter();
  const { sourceImageMeta, useExampleImage: selectExampleImage } = usePatternStore();

  function pickExample(example: (typeof EXAMPLE_IMAGES)[number]) {
    selectExampleImage(example.dataUrl, {
      name: example.name,
      type: "image/svg+xml",
      fromExample: true
    });

    if (redirectAfterSelect) {
      router.push("/workspace/upload");
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-black text-bean-ink">试试示例图</p>
          {!compact ? <p className="text-sm text-bean-muted">选择一个示例快速进入上传流程</p> : null}
        </div>
        <button className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-black text-milk-purple">
          换一换
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className={cn("grid gap-3", compact ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-3")}>
        {EXAMPLE_IMAGES.map((example) => {
          const active = sourceImageMeta?.fromExample && sourceImageMeta.name === example.name;

          return (
            <button
              key={example.id}
              type="button"
              className={cn(
                "group overflow-hidden rounded-2xl border bg-white text-left shadow-insetSoft transition hover:-translate-y-0.5 hover:shadow-soft",
                active ? "border-milk-purple ring-4 ring-milk-purple-soft" : "border-bean-border"
              )}
              onClick={() => pickExample(example)}
            >
              <img src={example.dataUrl} alt={example.name} className="aspect-[4/3] w-full object-cover" />
              {!compact ? (
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-black text-bean-ink">{example.name}</p>
                  <p className="truncate text-xs text-bean-muted">{example.hint}</p>
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
