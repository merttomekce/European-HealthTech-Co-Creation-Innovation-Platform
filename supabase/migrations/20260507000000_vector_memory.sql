create extension if not exists vector with schema extensions;

create table if not exists public.memory_items (
  id bigint generated always as identity primary key,
  source_type text not null,
  source_id text not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  embedding extensions.vector(1536) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists memory_items_source_unique
  on public.memory_items (source_type, source_id);

create index if not exists memory_items_embedding_hnsw
  on public.memory_items using hnsw (embedding vector_cosine_ops);

alter table public.memory_items enable row level security;
