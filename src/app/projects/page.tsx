"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderOpen, Loader2, Plus, RefreshCw, Star } from "lucide-react";

type ProjectCard = {
  id: string;
  title: string;
  status: string;
  source_image_url: string | null;
  cropped_image_url: string | null;
  cover_image_url: string | null;
  total_beads: number;
  color_count: number;
  is_favorite: boolean;
  updated_at: string;
};

type ProjectsResponse = {
  projects?: ProjectCard[];
  error?: string;
};

function isUnauthorized(response: Response) {
  return response.status === 401 || response.status === 403;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);

  async function loadProjects() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/projects?limit=30", {
        cache: "no-store",
        credentials: "same-origin"
      });
      const result = (await response.json()) as ProjectsResponse;

      if (isUnauthorized(response)) {
        setNeedsLogin(true);
        setProjects([]);
        return;
      }

      if (!response.ok) {
        setError(result.error || "项目列表加载失败");
        setProjects([]);
        return;
      }

      setNeedsLogin(false);
      setProjects(result.projects ?? []);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "项目列表加载失败");
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadProjects();
  }, []);

  if (needsLogin) {
    return (
      <section className="cream-card flex min-h-[520px] flex-col items-center justify-center rounded-4xl p-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-milk-purple-soft text-milk-purple">
          <FolderOpen className="h-10 w-10" />
        </div>
        <h1 className="mt-5 text-3xl font-black text-bean-ink">登录后查看项目</h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-bean-muted">本地体验无需登录，但保存和读取历史项目需要 Supabase Auth。</p>
        <Link className="primary-button mt-6" href="/login">
          去登录
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-5 lg:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-bean-ink">我的项目</h1>
          <p className="mt-1 text-sm text-bean-muted">查看保存在 Supabase 中的拼豆图纸项目。</p>
        </div>
        <div className="flex gap-3">
          <button className="ghost-button" disabled={isLoading} type="button" onClick={() => void loadProjects()}>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
            刷新
          </button>
          <Link className="primary-button" href="/workspace/upload">
            <Plus className="h-5 w-5" />
            新建项目
          </Link>
        </div>
      </div>

      {error ? (
        <section className="cream-card rounded-4xl p-6 text-center">
          <h2 className="text-2xl font-black text-bean-ink">项目列表加载失败</h2>
          <p className="mt-2 text-sm text-bean-muted">{error}</p>
          <button className="ghost-button mt-6" type="button" onClick={() => void loadProjects()}>重新加载</button>
        </section>
      ) : null}

      {isLoading ? <ProjectSkeleton /> : null}

      {!isLoading && !error && projects.length === 0 ? (
        <section className="cream-card flex min-h-[360px] flex-col items-center justify-center rounded-4xl p-6 text-center">
          <h2 className="text-2xl font-black text-bean-ink">还没有保存的项目</h2>
          <p className="mt-2 text-sm text-bean-muted">完成生成后，可以保存到项目列表。</p>
          <Link className="primary-button mt-6" href="/workspace/upload">开始创作</Link>
        </section>
      ) : null}

      {!isLoading && !error && projects.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const imageUrl = project.cover_image_url || project.cropped_image_url || project.source_image_url;

            return (
              <Link key={project.id} className="cream-card block rounded-4xl p-4 transition hover:-translate-y-0.5 hover:shadow-bead" href={`/projects/${project.id}`}>
                <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl bg-milk-purple-soft/40">
                  {imageUrl ? (
                    <img alt={project.title} className="h-full w-full object-cover" src={imageUrl} />
                  ) : (
                    <FolderOpen className="h-12 w-12 text-milk-purple" />
                  )}
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-black text-bean-ink">{project.title}</h2>
                    <p className="mt-1 text-sm text-bean-muted">{project.total_beads} 颗 · {project.color_count} 色</p>
                  </div>
                  {project.is_favorite ? <Star className="h-5 w-5 fill-milk-purple text-milk-purple" /> : null}
                </div>
                <p className="mt-3 text-xs text-bean-muted">更新于 {new Date(project.updated_at).toLocaleString("zh-CN")}</p>
              </Link>
            );
          })}
        </section>
      ) : null}
    </div>
  );
}

function ProjectSkeleton() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="cream-card rounded-4xl p-4">
          <div className="aspect-[4/3] animate-pulse rounded-3xl bg-milk-purple-soft/70" />
          <div className="mt-4 h-5 w-2/3 animate-pulse rounded-full bg-milk-purple-soft" />
          <div className="mt-3 h-4 w-1/2 animate-pulse rounded-full bg-milk-purple-soft/70" />
        </div>
      ))}
    </section>
  );
}
