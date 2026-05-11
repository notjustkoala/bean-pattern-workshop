import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

const tips = [
  {
    icon: CheckCircle2,
    title: "主体清晰",
    text: "宠物、头像、小物件和图标更适合生成清爽图纸"
  },
  {
    icon: Sparkles,
    title: "色彩集中",
    text: "颜色越干净，后续减色和材料统计越稳定"
  },
  {
    icon: ShieldCheck,
    title: "本地体验",
    text: "当前阶段先保存在浏览器状态中，不接入数据库"
  }
];

export function UploadTips() {
  return (
    <div className="rounded-3xl border border-bean-border bg-white/80 p-5 shadow-soft">
      <p className="text-lg font-black text-bean-ink">上传小贴士</p>
      <div className="mt-4 space-y-3">
        {tips.map((tip) => {
          const Icon = tip.icon;

          return (
            <div key={tip.title} className="flex gap-3 rounded-2xl bg-milk-purple-soft/50 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-milk-purple shadow-insetSoft">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-black text-bean-ink">{tip.title}</p>
                <p className="mt-1 text-sm leading-6 text-bean-muted">{tip.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
