import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Json } from "@/lib/supabase/database.types";
import type { GeneratedPattern, PatternConfig } from "@/types/pattern";

type PersistedPattern = Omit<GeneratedPattern, "cells" | "previewImageUrl"> & {
  cells?: never;
  previewImageUrl?: never;
};

type ProjectPayload = {
  title?: string;
  sourceImageUrl?: string | null;
  croppedImageUrl?: string | null;
  coverImageUrl?: string | null;
  config: PatternConfig;
  pattern?: GeneratedPattern | PersistedPattern | null;
  status?: "draft" | "generated" | "exported";
};

const PROJECT_LIST_COLUMNS = "id,title,status,source_image_url,cropped_image_url,cover_image_url,total_beads,color_count,is_favorite,created_at,updated_at";

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { supabase, user: null };
  }

  return { supabase, user: data.user };
}

function cleanImageUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("blob:") || url.startsWith("data:")) return null;
  return url;
}

function compactPattern(pattern?: ProjectPayload["pattern"]): PersistedPattern | null {
  if (!pattern) return null;

  return {
    id: pattern.id,
    width: pattern.width,
    height: pattern.height,
    totalBeads: pattern.totalBeads,
    colorCount: pattern.colorCount,
    colors: pattern.colors,
    materials: pattern.materials,
    createdAt: pattern.createdAt
  };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "请求内容无法解析";
}

export async function GET(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const keyword = url.searchParams.get("keyword");
  const limitValue = Number(url.searchParams.get("limit") ?? 30);
  const limit = Number.isFinite(limitValue) ? Math.min(Math.max(Math.trunc(limitValue), 1), 60) : 30;

  let query = supabase
    .from("projects")
    .select(PROJECT_LIST_COLUMNS)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (status && status !== "all") query = query.eq("status", status);
  if (keyword) query = query.ilike("title", `%${keyword}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ projects: data });
}

export async function POST(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  let payload: ProjectPayload;
  try {
    payload = (await request.json()) as ProjectPayload;
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }

  if (!payload.config) {
    return NextResponse.json({ error: "缺少图纸参数，无法保存项目" }, { status: 400 });
  }

  const pattern = compactPattern(payload.pattern);

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      title: payload.title || "未命名项目",
      status: payload.status ?? (pattern ? "generated" : "draft"),
      source_image_url: cleanImageUrl(payload.sourceImageUrl),
      cropped_image_url: cleanImageUrl(payload.croppedImageUrl),
      cover_image_url: cleanImageUrl(payload.coverImageUrl),
      config: payload.config as unknown as Json,
      pattern: pattern as unknown as Json,
      total_beads: pattern?.totalBeads ?? 0,
      color_count: pattern?.colorCount ?? 0
    })
    .select(PROJECT_LIST_COLUMNS)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (pattern?.materials?.length) {
    const { error: materialError } = await supabase.from("material_recommendations").insert(
      pattern.materials.map((item) => ({
        project_id: data.id,
        user_id: user.id,
        color_id: item.colorId,
        color_name: item.colorName,
        color_code: item.colorCode,
        hex: item.hex,
        required_count: item.requiredCount,
        recommended_count: item.recommendedCount,
        spare_count: item.spareCount,
        spare_rate: item.spareRate,
        alternative_colors: item.alternativeColors as unknown as Json
      }))
    );

    if (materialError) {
      await supabase.from("projects").delete().eq("id", data.id).eq("user_id", user.id);
      return NextResponse.json({ error: materialError.message }, { status: 400 });
    }
  }

  return NextResponse.json({ project: data });
}


