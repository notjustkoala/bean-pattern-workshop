import { CheckCircle2 } from "lucide-react";

const tools = [
  { name: "底板", hint: "透明或白色底板，便于对照坐标" },
  { name: "镊子", hint: "调整小颗粒位置更稳" },
  { name: "烫纸", hint: "固定图案时保护拼豆表面" }
];

export function ToolSuggestions() {
  return (
    <div className="cream-card rounded-4xl p-5">
      <h2 className="mb-4 text-xl font-black text-bean-ink">工具建议</h2>
      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
        {tools.map((tool) => (
          <div key={tool.name} className="flex gap-3 rounded-2xl border border-bean-border bg-white p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-milk-purple-soft text-milk-purple">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-black text-bean-ink">{tool.name}</p>
              <p className="mt-1 text-sm leading-5 text-bean-muted">{tool.hint}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
