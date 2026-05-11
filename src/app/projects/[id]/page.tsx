import Link from "next/link";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase/database.types";

type ProjectDetailPageProps = {
  params: Promise<{ id: string }>;
};

type MaterialRow = Database["public"]["Tables"]["material_recommendations"]["Row"];

const PROJECT_DETAIL_COLUMNS = "id,title,status,source_image_url,cropped_image_url,cover_image_url,total_beads,color_count,created_at,updated_at";

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return <LoginRequired />;
  }

  const { data: project, error } = await supabase
    .from("projects")
    .select(PROJECT_DETAIL_COLUMNS)
    .eq("id", id)
    .eq("user_id", userData.user.id)
    .single();

  if (error || !project) {
    return (
      <section className="cream-card rounded-4xl p-6 text-center">
        <h1 className="text-2xl font-black text-bean-ink">项目不存在或无权访问</h1>
        <Link className="ghost-button mt-6" href="/projects">返回项目列表</Link>
      </section>
    );
  }

  const { data: materialRows } = await supabase
    .from("material_recommendations")
    .select("*")
    .eq("project_id", project.id)
    .eq("user_id", userData.user.id)
    .order("required_count", { ascending: false });
  const materials: MaterialRow[] = materialRows ?? [];
  const imageUrl = project.cover_image_url || project.cropped_image_url || project.source_image_url;

  return (
    <div className="space-y-5 lg:space-y-6">
      <Link className="ghost-button" href="/projects">
        <ArrowLeft className="h-5 w-5" />
        返回项目列表
      </Link>
      <section className="cream-card rounded-4xl p-5 md:p-6">
        <h1 className="text-3xl font-black text-bean-ink">{project.title}</h1>
        <p className="mt-2 text-sm text-bean-muted">{project.status} · {project.total_beads} 颗 · {project.color_count} 色</p>
        <div className="mt-5 grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-milk-purple-soft/40">
            {imageUrl ? (
              <img alt={project.title} className="h-full w-full object-cover" src={imageUrl} />
            ) : (
              <ClipboardList className="h-12 w-12 text-milk-purple" />
            )}
          </div>
          <div className="rounded-3xl border border-bean-border bg-white/80 p-4">
            <h2 className="font-black text-bean-ink">材料推荐</h2>
            <div className="mt-4 space-y-2">
              {materials.length === 0 ? (
                <p className="rounded-2xl bg-milk-purple-soft/50 p-4 text-sm text-bean-muted">这个项目暂时没有材料明细。</p>
              ) : (
                materials.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl bg-milk-purple-soft/40 p-3">
                    <div className="flex items-center gap-3">
                      <span className="h-5 w-5 rounded-full border border-bean-border" style={{ backgroundColor: item.hex }} />
                      <span className="font-bold text-bean-ink">{item.color_code} {item.color_name}</span>
                    </div>
                    <span className="font-black text-milk-purple">{item.recommended_count} 颗</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function LoginRequired() {
  return (
    <section className="cream-card rounded-4xl p-6 text-center">
      <h1 className="text-2xl font-black text-bean-ink">请先登录</h1>
      <Link className="primary-button mt-6" href="/login">去登录</Link>
    </section>
  );
}

