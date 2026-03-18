-- ================================================================
-- FasecTracker — Migración Inicial para Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- ================================================================

-- Extensiones
create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------
-- PROFILES (extende auth.users)
-- ----------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- PROJECTS
-- ----------------------------------------------------------------
create table public.projects (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  color       text not null default '#6366f1',
  cover_url   text,
  owner_id    uuid not null references public.profiles(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create index idx_projects_owner   on public.projects(owner_id);
create index idx_projects_active  on public.projects(owner_id) where deleted_at is null;

-- ----------------------------------------------------------------
-- PROJECT MEMBERS
-- ----------------------------------------------------------------
create table public.project_members (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  role        text not null default 'editor',  -- 'owner' | 'editor'
  created_at  timestamptz not null default now(),
  unique(project_id, user_id)
);

create index idx_project_members_user    on public.project_members(user_id);
create index idx_project_members_project on public.project_members(project_id);

-- ----------------------------------------------------------------
-- CONTENT TEMPLATES
-- ----------------------------------------------------------------
create table public.content_templates (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  name        text not null,
  description text,
  structure   jsonb not null default '{}',
  -- {
  --   "sections": ["ideas","script","notes"],
  --   "fields": [{"key":"ideas","label":"Ideas","type":"rich_text","required":false}],
  --   "checklist": [{"id":"c1","label":"Grabar","required":true}],
  --   "default_content_type": "video"
  -- }
  is_default  boolean not null default false,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_templates_project on public.content_templates(project_id);

-- ----------------------------------------------------------------
-- CATEGORIES (por proyecto)
-- ----------------------------------------------------------------
create table public.categories (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  name        text not null,
  color       text not null default '#94a3b8',
  created_at  timestamptz not null default now()
);

create index idx_categories_project on public.categories(project_id);

-- ----------------------------------------------------------------
-- SERIES (por proyecto)
-- ----------------------------------------------------------------
create table public.series (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  name        text not null,
  description text,
  cover_url   text,
  created_at  timestamptz not null default now()
);

create index idx_series_project on public.series(project_id);

-- ----------------------------------------------------------------
-- TAGS (globales)
-- ----------------------------------------------------------------
create table public.tags (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  color       text not null default '#64748b',
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- CONTENT ITEMS
-- ----------------------------------------------------------------
create table public.content_items (
  id                uuid primary key default uuid_generate_v4(),
  project_id        uuid not null references public.projects(id) on delete cascade,
  template_id       uuid references public.content_templates(id) on delete set null,
  template_snapshot jsonb,
  -- Snapshot de la estructura del template al momento de crear la pieza

  title             text not null,
  status            text not null default 'idea',
  -- 'idea' | 'script' | 'production' | 'editing' | 'review' | 'scheduled' | 'published'
  content_type      text not null default 'video',
  -- 'video' | 'carousel' | 'blog' | 'reel' | 'short' | 'other'

  published_at      timestamptz,
  cover_url         text,

  category_id       uuid references public.categories(id) on delete set null,
  series_id         uuid references public.series(id) on delete set null,
  assigned_to       uuid references public.profiles(id) on delete set null,
  created_by        uuid not null references public.profiles(id),

  fields_data       jsonb not null default '{}',
  -- Tiptap JSON por campo: { "ideas": {...}, "script": {...}, "notes": {...} }
  checklist_data    jsonb not null default '[]',
  -- [{ "id": "c1", "label": "Grabar", "checked": false }]
  meta              jsonb not null default '{}',

  kanban_order      float8 not null default 0,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz
);

create index idx_items_project    on public.content_items(project_id);
create index idx_items_status     on public.content_items(project_id, status) where deleted_at is null;
create index idx_items_published  on public.content_items(project_id, published_at) where deleted_at is null;
create index idx_items_order      on public.content_items(project_id, status, kanban_order) where deleted_at is null;

-- ----------------------------------------------------------------
-- ITEM TAGS (N:N)
-- ----------------------------------------------------------------
create table public.item_tags (
  item_id uuid not null references public.content_items(id) on delete cascade,
  tag_id  uuid not null references public.tags(id) on delete cascade,
  primary key (item_id, tag_id)
);

create index idx_item_tags_tag  on public.item_tags(tag_id);
create index idx_item_tags_item on public.item_tags(item_id);

-- ----------------------------------------------------------------
-- CONTENT RESOURCES
-- ----------------------------------------------------------------
create table public.content_resources (
  id          uuid primary key default uuid_generate_v4(),
  item_id     uuid not null references public.content_items(id) on delete cascade,
  type        text not null, -- 'file' | 'link'
  label       text,
  url         text not null,
  mime_type   text,
  size_bytes  bigint,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now()
);

create index idx_resources_item on public.content_resources(item_id);

-- ================================================================
-- TRIGGERS
-- ================================================================

-- Trigger: updated_at automático
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create trigger trg_templates_updated_at
  before update on public.content_templates
  for each row execute function public.set_updated_at();

create trigger trg_items_updated_at
  before update on public.content_items
  for each row execute function public.set_updated_at();

-- Trigger: auto-crear perfil al registrar usuario
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

alter table public.profiles          enable row level security;
alter table public.projects          enable row level security;
alter table public.project_members   enable row level security;
alter table public.content_templates enable row level security;
alter table public.categories        enable row level security;
alter table public.series            enable row level security;
alter table public.tags              enable row level security;
alter table public.content_items     enable row level security;
alter table public.item_tags         enable row level security;
alter table public.content_resources enable row level security;

-- Helper: ¿el usuario actual es miembro de este proyecto?
create or replace function public.is_project_member(p_project_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.project_members
    where project_id = p_project_id
      and user_id = auth.uid()
  );
$$;

-- PROFILES
create policy "profiles_own"         on public.profiles for select using (id = auth.uid());
create policy "profiles_update_own"  on public.profiles for update using (id = auth.uid());
create policy "profiles_teammates"   on public.profiles
  for select using (
    exists (
      select 1 from public.project_members pm1
      join public.project_members pm2 on pm1.project_id = pm2.project_id
      where pm1.user_id = auth.uid() and pm2.user_id = profiles.id
    )
  );

-- PROJECTS
create policy "projects_member_select" on public.projects for select using (public.is_project_member(id));
create policy "projects_owner_insert"  on public.projects for insert with check (owner_id = auth.uid());
create policy "projects_owner_update"  on public.projects for update using (owner_id = auth.uid());
create policy "projects_owner_delete"  on public.projects for delete using (owner_id = auth.uid());

-- PROJECT MEMBERS
create policy "pm_member_select" on public.project_members for select using (public.is_project_member(project_id));
create policy "pm_owner_insert"  on public.project_members for insert
  with check (exists(select 1 from public.projects where id = project_id and owner_id = auth.uid()));
create policy "pm_owner_delete"  on public.project_members for delete
  using (exists(select 1 from public.projects where id = project_id and owner_id = auth.uid()));

-- Recursos del proyecto: acceso a miembros
create policy "templates_member"  on public.content_templates for all using (public.is_project_member(project_id));
create policy "categories_member" on public.categories         for all using (public.is_project_member(project_id));
create policy "series_member"     on public.series             for all using (public.is_project_member(project_id));
create policy "items_member"      on public.content_items      for all using (public.is_project_member(project_id));

-- Tags globales
create policy "tags_auth_select" on public.tags for select using (auth.uid() is not null);
create policy "tags_auth_insert" on public.tags for insert with check (auth.uid() is not null);

-- Item tags
create policy "item_tags_member" on public.item_tags for all using (
  exists(select 1 from public.content_items ci where ci.id = item_id and public.is_project_member(ci.project_id))
);

-- Resources
create policy "resources_member" on public.content_resources for all using (
  exists(select 1 from public.content_items ci where ci.id = item_id and public.is_project_member(ci.project_id))
);

-- ================================================================
-- STORAGE BUCKET
-- ================================================================
-- Ejecutar este bloque solo si no existe el bucket todavía.
-- En el Dashboard: Storage → New Bucket → "content-resources" (Private)

insert into storage.buckets (id, name, public)
values ('content-resources', 'content-resources', false)
on conflict (id) do nothing;

create policy "storage_upload" on storage.objects
  for insert with check (bucket_id = 'content-resources' and auth.uid() is not null);
create policy "storage_select" on storage.objects
  for select using (bucket_id = 'content-resources' and auth.uid() is not null);
create policy "storage_delete" on storage.objects
  for delete using (bucket_id = 'content-resources' and auth.uid() is not null);
