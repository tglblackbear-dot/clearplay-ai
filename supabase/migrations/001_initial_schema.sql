-- ClearPlay AI · schema inicial com RLS.
create extension if not exists pgcrypto with schema extensions;

create table public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  settings jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table public.contents (
  id uuid primary key default gen_random_uuid(),
  external_id text,
  title text not null,
  content_type text not null default 'movie' check (content_type in ('movie', 'series')),
  release_year integer,
  normalized_title text not null,
  created_at timestamptz not null default now()
);
create index contents_normalized_idx on public.contents using gin (to_tsvector('simple', normalized_title));

create table public.episodes (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.contents(id) on delete cascade,
  season_number integer,
  episode_number integer,
  duration_ms integer,
  version_fingerprint text,
  created_at timestamptz not null default now()
);
create index episodes_content_idx on public.episodes(content_id);

create table public.cut_manifests (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references public.episodes(id) on delete cascade,
  version integer not null check (version > 0),
  status text not null default 'draft' check (status in ('draft', 'review', 'verified', 'rejected')),
  confidence numeric(4,3) not null default 0 check (confidence between 0 and 1),
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (episode_id, version)
);

create table public.cut_segments (
  id uuid primary key default gen_random_uuid(),
  manifest_id uuid not null references public.cut_manifests(id) on delete cascade,
  category text not null check (category in ('nudity','sex','violence','graphic_violence','language','drugs','alcohol','disturbing')),
  start_ms integer not null check (start_ms >= 0),
  end_ms integer not null check (end_ms > start_ms),
  confidence numeric(4,3) not null check (confidence between 0 and 1),
  description text,
  source text
);
create index cut_segments_manifest_idx on public.cut_segments(manifest_id);

create table public.content_sources (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references public.episodes(id) on delete cascade,
  source_name text not null,
  external_reference text,
  verification_status text not null default 'unverified' check (verification_status in ('unverified','reviewed','verified','rejected')),
  created_at timestamptz not null default now()
);

create table public.user_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  segment_id uuid not null references public.cut_segments(id) on delete cascade,
  feedback_type text not null check (feedback_type in ('wrong_time','wrong_category','false_positive','missed','other')),
  created_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;
alter table public.user_feedback enable row level security;
alter table public.contents enable row level security;
alter table public.episodes enable row level security;
alter table public.cut_manifests enable row level security;
alter table public.cut_segments enable row level security;
alter table public.content_sources enable row level security;

-- Preferências privadas: somente o dono.
create policy "Users manage own profiles" on public.user_profiles
for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Users manage own feedback" on public.user_feedback
for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Mapas públicos: leitura para usuários autenticados, escrita somente via servicio/backend.
create policy "Authenticated read contents" on public.contents for select to authenticated using (true);
create policy "Authenticated read episodes" on public.episodes for select to authenticated using (true);
create policy "Authenticated read manifests" on public.cut_manifests for select to authenticated using (status = 'verified');
create policy "Authenticated read segments" on public.cut_segments for select to authenticated using (true);
create policy "Authenticated read sources" on public.content_sources for select to authenticated using (true);

grant select on public.contents, public.episodes, public.cut_manifests, public.cut_segments, public.content_sources to authenticated;
grant all on public.user_profiles, public.user_feedback to authenticated;
