import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Json } from "@/lib/supabase/database.types";

const PROJECT_DETAIL_COLUMNS = "id,user_id,title,status,source_image_url,cropped_image_url,cover_image_url,config,pattern,total_beads,color_count,is_favorite,created_at,updated_at";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) return { supabase, user: null };
  return { supabase, user: data.user };
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { data: project, error } = await supabase
    .from("projects")
    .select(PROJECT_DETAIL_COLUMNS)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  const [{ data: materials, error: materialsError }, { data: exportRecords, error: exportError }] = await Promise.all([
    supabase.from("material_recommendations").select("*").eq("project_id", id).eq("user_id", user.id),
    supabase.from("export_records").select("*").eq("project_id", id).eq("user_id", user.id)
  ]);

  if (materialsError) return NextResponse.json({ error: materialsError.message }, { status: 400 });
  if (exportError) return NextResponse.json({ error: exportError.message }, { status: 400 });

  return NextResponse.json({ project: { ...project, material_recommendations: materials ?? [], export_records: exportRecords ?? [] } });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const payload = (await request.json()) as Record<string, unknown>;
  const { data, error } = await supabase
    .from("projects")
    .update({
      title: payload.title as string | undefined,
      status: payload.status as string | undefined,
      config: payload.config as Json | undefined,
      pattern: payload.pattern as Json | undefined,
      is_favorite: payload.isFavorite as boolean | undefined,
      total_beads: payload.totalBeads as number | undefined,
      color_count: payload.colorCount as number | undefined
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select(PROJECT_DETAIL_COLUMNS)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ project: data });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { error } = await supabase.from("projects").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}

