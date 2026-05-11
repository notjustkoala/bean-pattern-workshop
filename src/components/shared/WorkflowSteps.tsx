import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const workflowSteps = ["上传图片", "裁剪调整", "参数设置", "生成图纸", "图纸预览"];

type WorkflowStepsProps = {
  current: number;
  completed?: number[];
};

export function WorkflowSteps({ current, completed = [] }: WorkflowStepsProps) {
  return (
    <section className="soft-panel rounded-3xl p-4 md:p-5">
      <div className="flex flex-wrap items-center gap-3 md:justify-between">
        {workflowSteps.map((step, index) => {
          const stepNumber = index + 1;
          const active = stepNumber === current;
          const done = completed.includes(stepNumber);

          return (
            <div key={step} className="flex min-w-[120px] flex-1 items-center gap-3">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black",
                  active || done ? "bg-purple-button text-white shadow-bead" : "bg-milk-purple-soft text-bean-muted"
                )}
              >
                {done ? <CheckCircle2 className="h-5 w-5" /> : stepNumber}
              </div>
              <span className={cn("text-sm font-black", active ? "text-milk-purple" : "text-bean-muted")}>
                {step}
              </span>
              {index < workflowSteps.length - 1 ? (
                <span className="hidden h-px flex-1 border-t border-dashed border-milk-purple-light md:block" />
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
