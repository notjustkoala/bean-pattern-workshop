import Link from "next/link";
import { ArrowRight, ClipboardList, Palette, Sparkles, UploadCloud } from "lucide-react";
import { BeadMascot } from "@/components/shared/BeadMascot";
import { ExampleImageGrid } from "@/components/upload/ExampleImageGrid";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { EXAMPLE_IMAGES } from "@/lib/constants/examples";

const featureCards = [
  {
    icon: Palette,
    title: "AI 智能减色",
    text: "分析图片色彩，自动优化为适合拼豆的用色范围。",
    tint: "from-milk-purple-soft to-white"
  },
  {
    icon: Sparkles,
    title: "精细图纸生成",
    text: "按尺寸、颜色和难度输出清晰圆点图纸。",
    tint: "from-sky-50 to-white"
  },
  {
    icon: ClipboardList,
    title: "材料推荐清单",
    text: "根据图纸统计颜色与颗数，生成备豆建议。",
    tint: "from-emerald-50 to-white"
  }
];

const recentProjects = [
  { title: "小狮子", size: "48 x 48 | 15色", image: EXAMPLE_IMAGES[0].dataUrl },
  { title: "豆豆酱头像", size: "64 x 64 | 12色", image: EXAMPLE_IMAGES[5].dataUrl },
  { title: "海边日落", size: "96 x 64 | 28色", image: EXAMPLE_IMAGES[2].dataUrl },
  { title: "仙人掌盆栽", size: "48 x 64 | 10色", image: EXAMPLE_IMAGES[4].dataUrl }
];

export default function HomePage() {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-4xl border border-bean-border bg-gradient-to-br from-milk-purple-soft/80 via-white to-cream-2 p-6 shadow-soft md:p-10 lg:min-h-[360px]">
        <span className="bead-sparkle left-[58%] top-8 hidden h-5 w-5 lg:block" style={{ "--bead-color": "#FB7185" } as React.CSSProperties} />
        <span className="bead-sparkle left-[64%] top-20 hidden h-4 w-4 lg:block" style={{ "--bead-color": "#8B5CF6" } as React.CSSProperties} />
        <span className="bead-sparkle right-16 bottom-12 hidden h-5 w-5 lg:block" style={{ "--bead-color": "#60A5FA" } as React.CSSProperties} />

        <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.8fr)]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-bean-border bg-white/80 px-4 py-2 text-sm font-black text-milk-purple shadow-insetSoft">
              <Sparkles className="h-4 w-4" />
              奶油紫拼豆工坊风
            </div>
            <h1 className="max-w-[580px] text-5xl font-black leading-tight text-bean-ink md:text-6xl">
              把照片一键
              <span className="block text-milk-purple">变成拼豆图纸</span>
            </h1>
            <p className="mt-5 max-w-[560px] text-lg font-medium leading-8 text-bean-muted">
              上传图片后即可进入裁剪、参数设置、图纸生成和材料推荐流程，适合宠物头像、小物件和像素风作品。
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/workspace/upload" className="primary-button text-base">
                <UploadCloud className="h-5 w-5" />
                开始上传
              </Link>
              <a href="#examples" className="ghost-button text-base">
                试试示例图
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[520px]">
            <BeadMascot size="lg" withBoard className="w-full" />
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(390px,0.92fr)]">
        <div className="cream-card rounded-4xl p-5 md:p-6">
          <UploadDropzone variant="hero" redirectAfterSelect />
        </div>

        <div id="examples" className="cream-card rounded-4xl p-5 md:p-6">
          <ExampleImageGrid compact redirectAfterSelect />
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {featureCards.map((feature) => {
          const Icon = feature.icon;

          return (
            <article
              key={feature.title}
              className={`rounded-3xl border border-bean-border bg-gradient-to-br ${feature.tint} p-5 shadow-soft`}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-bean-border bg-white text-milk-purple shadow-insetSoft">
                <Icon className="h-8 w-8" />
              </div>
              <h2 className="mt-5 text-xl font-black text-bean-ink">{feature.title}</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-bean-muted">{feature.text}</p>
              <Link href="/workspace/upload" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-milk-purple">
                了解更多
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          );
        })}
      </section>

      <section className="cream-card rounded-4xl p-5 md:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-bean-ink">最近项目</h2>
            <p className="mt-1 text-sm text-bean-muted">继续创作或用示例图快速体验</p>
          </div>
          <Link href="/workspace/upload" className="hidden items-center gap-2 text-sm font-black text-milk-purple sm:inline-flex">
            查看全部
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {recentProjects.map((project) => (
            <article key={project.title} className="rounded-3xl border border-bean-border bg-white/90 p-3 shadow-insetSoft">
              <img src={project.image} alt={project.title} className="aspect-[4/3] w-full rounded-2xl object-cover" />
              <div className="mt-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black text-bean-ink">{project.title}</h3>
                  <p className="mt-1 text-sm text-bean-muted">{project.size}</p>
                </div>
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-milk-purple-soft text-milk-purple" aria-label={`${project.title} 更多操作`}>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-4xl border border-bean-border bg-gradient-to-r from-milk-purple-soft via-white to-cream-2 p-5 shadow-soft md:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-milk-purple shadow-insetSoft">
              <Sparkles className="h-7 w-7" />
            </div>
            <div>
              <p className="text-lg font-black text-bean-ink">还没有灵感？去模板中心看看吧！</p>
              <p className="mt-1 text-sm text-bean-muted">海量精美模板会在后续版本接入。</p>
            </div>
          </div>
          <Link href="/workspace/upload" className="primary-button">
            去生成图纸
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
