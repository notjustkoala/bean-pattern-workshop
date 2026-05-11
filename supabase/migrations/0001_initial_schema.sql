-- Bean Pattern Workshop Supabase schema
-- Run in Supabase SQL Editor after creating the project.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text,
  avatar_url text,
  plan text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '未命名项目',
  status text not null default 'draft' check (status in ('draft', 'generated', 'exported')),
  source_image_url text,
  cropped_image_url text,
  cover_image_url text,
  config jsonb not null default '{}'::jsonb,
  pattern jsonb,
  total_beads int not null default 0,
  color_count int not null default 0,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.material_recommendations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  color_id text not null,
  color_name text not null,
  color_code text not null,
  hex text not null,
  required_count int not null,
  recommended_count int not null,
  spare_count int not null,
  spare_rate numeric not null,
  alternative_colors jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.export_records (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  export_type text not null check (export_type in ('png', 'pdf', 'share')),
  file_url text,
  created_at timestamptz not null default now()
);

create index if not exists projects_user_updated_idx on public.projects(user_id, updated_at desc);
create index if not exists projects_user_status_idx on public.projects(user_id, status);
create index if not exists material_recommendations_project_idx on public.material_recommendations(project_id);
create index if not exists export_records_project_idx on public.export_records(project_id);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at before update on public.projects
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.material_recommendations enable row level security;
alter table public.export_records enable row level security;

create policy "Profiles are viewable by owner"
on public.profiles for select
to authenticated
using (auth.uid() = id);

create policy "Profiles are insertable by owner"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "Profiles are updatable by owner"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Projects are viewable by owner"
on public.projects for select
to authenticated
using (auth.uid() = user_id);

create policy "Projects are insertable by owner"
on public.projects for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Projects are updatable by owner"
on public.projects for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Projects are deletable by owner"
on public.projects for delete
to authenticated
using (auth.uid() = user_id);

create policy "Materials are viewable by owner"
on public.material_recommendations for select
to authenticated
using (auth.uid() = user_id);

create policy "Materials are insertable by owner"
on public.material_recommendations for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.projects
    where projects.id = material_recommendations.project_id
      and projects.user_id = auth.uid()
  )
);

create policy "Materials are deletable by owner"
on public.material_recommendations for delete
to authenticated
using (auth.uid() = user_id);

create policy "Export records are viewable by owner"
on public.export_records for select
to authenticated
using (auth.uid() = user_id);

create policy "Export records are insertable by owner"
on public.export_records for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.projects
    where projects.id = export_records.project_id
      and projects.user_id = auth.uid()
  )
);

create policy "Export records are deletable by owner"
on public.export_records for delete
to authenticated
using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nickname, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('project-images', 'project-images', false, 20971520, array['image/jpeg', 'image/png', 'image/webp']),
  ('project-exports', 'project-exports', false, 52428800, array['image/png', 'application/pdf']),
  ('template-assets', 'template-assets', true, 20971520, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Users can read own project images"
on storage.objects for select
to authenticated
using (bucket_id = 'project-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can upload own project images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'project-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update own project images"
on storage.objects for update
to authenticated
using (bucket_id = 'project-images' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'project-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete own project images"
on storage.objects for delete
to authenticated
using (bucket_id = 'project-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can read own project exports"
on storage.objects for select
to authenticated
using (bucket_id = 'project-exports' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can upload own project exports"
on storage.objects for insert
to authenticated
with check (bucket_id = 'project-exports' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update own project exports"
on storage.objects for update
to authenticated
using (bucket_id = 'project-exports' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'project-exports' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete own project exports"
on storage.objects for delete
to authenticated
using (bucket_id = 'project-exports' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Anyone can read template assets"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'template-assets');
