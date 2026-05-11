import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const payload = (await request.json()) as {
    projectId: string;
    exportType: "png" | "pdf" | "share";
    fileUrl?: string | null;
  };

  const { data, error } = await supabase
    .from("export_records")
    .insert({
      project_id: payload.projectId,
      user_id: userData.user.id,
      export_type: payload.exportType,
      file_url: payload.fileUrl ?? null
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ exportRecord: data });
}

