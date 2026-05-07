const { Pool } = require('pg');

const MEMORY_SOURCE_TYPE = 'announcement';
const INDEXABLE_STATUSES = new Set(['ACTIVE', 'PARTNER_FOUND', 'MEETING_SCHEDULED']);
const EMBEDDING_MODEL = (process.env.LOCAL_AI_EMBEDDING_MODEL || process.env.EMBEDDING_MODEL || 'text-embedding-3-small').trim();
const EMBEDDING_DIMENSIONS = Number(process.env.LOCAL_AI_EMBEDDING_DIMENSIONS || process.env.EMBEDDING_DIMS || 1536);
const LOCAL_AI_BASE_URL = (process.env.LOCAL_AI_BASE_URL || 'http://127.0.0.1:8001/v1').trim();
const LOCAL_AI_API_KEY = (process.env.LOCAL_AI_API_KEY || '1234').trim();

let poolSingleton = null;
let schemaReadyPromise = null;
let bootstrapPromise = null;
let localAiProviderPromise = null;
let memoryDisabledReason = null;

function getPool() {
  if (poolSingleton) return poolSingleton;

  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('Missing DIRECT_URL or DATABASE_URL for vector memory');
  }

  poolSingleton = new Pool({
    connectionString,
    max: 2,
  });

  return poolSingleton;
}

async function getLocalAiProvider() {
  if (!localAiProviderPromise) {
    localAiProviderPromise = import('@ai-sdk/openai').then(({ createOpenAI }) =>
      createOpenAI({
        baseURL: LOCAL_AI_BASE_URL,
        apiKey: LOCAL_AI_API_KEY,
      }),
    );
  }

  return localAiProviderPromise;
}

function compact(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildAnnouncementMemoryText(announcement) {
  const parts = [
    `Title: ${compact(announcement.title)}`,
    `Domain: ${compact(announcement.domain)}`,
    `Summary: ${compact(announcement.publicPitch || announcement.explanation)}`,
    `Need: ${compact(announcement.expertiseNeeded)}`,
    `Stage: ${compact(announcement.projectStage)}`,
    `Commitment: ${compact(announcement.commitmentLevel)}`,
    `Collaboration type: ${compact(announcement.collaborationType || 'Not set')}`,
    `Confidentiality: ${compact(announcement.confidentiality)}`,
    `Location: ${compact([announcement.city, announcement.country].filter(Boolean).join(', '))}`,
    `Status: ${compact(announcement.status)}`,
  ];

  return parts.filter((part) => !part.endsWith(':')).join('\n');
}

function buildAnnouncementMemoryMetadata(announcement) {
  return {
    announcementId: announcement.id,
    title: compact(announcement.title),
    domain: compact(announcement.domain),
    city: compact(announcement.city),
    country: compact(announcement.country),
    projectStage: compact(announcement.projectStage),
    commitmentLevel: compact(announcement.commitmentLevel),
    collaborationType: compact(announcement.collaborationType || null),
    confidentiality: compact(announcement.confidentiality),
    status: compact(announcement.status),
    updatedAt: announcement.updatedAt ? new Date(announcement.updatedAt).toISOString() : new Date().toISOString(),
  };
}

function isIndexableAnnouncement(announcement) {
  if (!announcement?.id) return false;
  if (!announcement?.title) return false;
  return INDEXABLE_STATUSES.has(String(announcement.status || '').toUpperCase());
}

function toVectorLiteral(embedding) {
  return `[${embedding.join(',')}]`;
}

async function ensureMemorySchema() {
  if (memoryDisabledReason) return false;

  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      const client = getPool();
      await client.query('create extension if not exists vector with schema extensions;');
      await client.query(`
        create table if not exists public.memory_items (
          id bigint generated always as identity primary key,
          source_type text not null,
          source_id text not null,
          content text not null,
          metadata jsonb not null default '{}'::jsonb,
          embedding extensions.vector(${EMBEDDING_DIMENSIONS}) not null,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        );
      `);
      await client.query(`
        create unique index if not exists memory_items_source_unique
        on public.memory_items (source_type, source_id);
      `);
      await client.query(`
        create index if not exists memory_items_embedding_hnsw
        on public.memory_items using hnsw (embedding vector_cosine_ops);
      `);
      await client.query('alter table public.memory_items enable row level security;');
      return true;
    })().catch((error) => {
      memoryDisabledReason = `Vector memory disabled: ${error.message || 'connection failed'}`;
      console.warn(memoryDisabledReason);
      schemaReadyPromise = null;
      return false;
    });
  }

  return schemaReadyPromise;
}

async function embedText(text) {
  const value = compact(text);
  if (!value) return null;

  const { embed } = await import('ai');
  const provider = await getLocalAiProvider();

  try {
    const { embedding } = await embed({
      model: provider.embedding(EMBEDDING_MODEL),
      value,
    });

    return embedding;
  } catch (error) {
    console.error('Vector embedding failed:', error);
    return null;
  }
}

async function deleteMemoryItem(sourceId) {
  const ready = await ensureMemorySchema();
  if (!ready) return;

  const client = getPool();
  await client.query(
    'delete from public.memory_items where source_type = $1 and source_id = $2',
    [MEMORY_SOURCE_TYPE, sourceId],
  );
}

async function syncAnnouncementMemory(announcement) {
  try {
    const ready = await ensureMemorySchema();
    if (!ready) return { indexed: false };

    if (!isIndexableAnnouncement(announcement)) {
      await deleteMemoryItem(announcement.id);
      return { indexed: false };
    }

    const embedding = await embedText(buildAnnouncementMemoryText(announcement));
    if (!embedding) {
      return { indexed: false, error: 'Embedding generation failed' };
    }

    const client = getPool();
    const content = buildAnnouncementMemoryText(announcement);
    const metadata = buildAnnouncementMemoryMetadata(announcement);
    const vectorLiteral = toVectorLiteral(embedding);

    await client.query(
      `
        insert into public.memory_items (
          source_type,
          source_id,
          content,
          metadata,
          embedding,
          updated_at
        )
        values ($1, $2, $3, $4::jsonb, $5::vector, now())
        on conflict (source_type, source_id)
        do update set
          content = excluded.content,
          metadata = excluded.metadata,
          embedding = excluded.embedding,
          updated_at = now()
      `,
      [MEMORY_SOURCE_TYPE, announcement.id, content, JSON.stringify(metadata), vectorLiteral],
    );

    return { indexed: true };
  } catch (error) {
    memoryDisabledReason = `Vector memory disabled: ${error.message || 'unknown error'}`;
    console.warn(memoryDisabledReason);
    return { indexed: false, error: error.message || 'Vector memory unavailable' };
  }
}

async function backfillAnnouncementMemoryIfNeeded() {
  const ready = await ensureMemorySchema();
  if (!ready) return false;

  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    const client = getPool();
    const { rows } = await client.query('select count(*)::int as count from public.memory_items where source_type = $1', [MEMORY_SOURCE_TYPE]);
    if (rows[0]?.count > 0) return;

    const announcementRows = await client.query(
      `
        select
          id,
          title,
          domain,
          explanation,
          "expertiseNeeded",
          "projectStage",
          "commitmentLevel",
          "collaborationType",
          confidentiality,
          "publicPitch",
          city,
          country,
          status,
          "updatedAt"
        from public."Announcement"
        where status = any($1::text[])
      `,
      [['ACTIVE', 'PARTNER_FOUND', 'MEETING_SCHEDULED']],
    );

    for (const announcement of announcementRows.rows) {
      await syncAnnouncementMemory(announcement);
    }
    return true;
  })().catch((error) => {
    memoryDisabledReason = `Vector memory disabled: ${error.message || 'unknown error'}`;
    console.warn(memoryDisabledReason);
    bootstrapPromise = null;
    return false;
  });

  return bootstrapPromise;
}

async function embedQuery(query) {
  return embedText(query);
}

async function searchMemoryItems(query, limit = 5) {
  try {
    const ready = await backfillAnnouncementMemoryIfNeeded();
    if (!ready) return [];

    const trimmed = compact(query);
    if (!trimmed) return [];

    const embedding = await embedQuery(trimmed);
    if (!embedding) {
      return [];
    }

    const client = getPool();
    const vectorLiteral = toVectorLiteral(embedding);
    const { rows } = await client.query(
      `
        select
          source_id,
          content,
          metadata,
          1 - (embedding <=> $1::vector) as similarity
        from public.memory_items
        where source_type = $2
        order by embedding <=> $1::vector
        limit $3
      `,
      [vectorLiteral, MEMORY_SOURCE_TYPE, limit],
    );

    return rows.map((row) => ({
      sourceId: row.source_id,
      content: row.content,
      metadata: row.metadata,
      similarity: Number(row.similarity),
    }));
  } catch (error) {
    memoryDisabledReason = `Vector memory disabled: ${error.message || 'unknown error'}`;
    console.warn(memoryDisabledReason);
    return [];
  }
}

async function searchAnnouncementsByMemory(query, limit = 5) {
  try {
    const memoryItems = await searchMemoryItems(query, limit);
    if (memoryItems.length === 0) {
      const trimmed = compact(query);
      if (!trimmed) return [];

      const client = getPool();
      const { rows } = await client.query(
        `
          select
            a.*,
            json_build_object(
              'name', u.name,
              'institution', u.institution,
              'city', u.city,
              'country', u.country,
              'role', u.role
            ) as author
          from public."Announcement" a
          left join public."User" u on u.id = a."authorId"
          where a.status = any($1::text[])
            and (
              a.title ilike $2
              or a.explanation ilike $2
              or coalesce(a."publicPitch", '') ilike $2
              or a.domain ilike $2
              or a."expertiseNeeded" ilike $2
            )
          order by a."createdAt" desc
          limit $3
        `,
        [['ACTIVE', 'PARTNER_FOUND', 'MEETING_SCHEDULED'], `%${trimmed}%`, limit],
      );

      return rows.map((announcement) => ({ ...announcement, memoryScore: 0 }));
    }

    const ids = memoryItems.map((item) => item.sourceId);
    const client = getPool();
    const { rows } = await client.query(
      `
        select
          a.*,
          json_build_object(
            'name', u.name,
            'institution', u.institution,
            'city', u.city,
            'country', u.country,
            'role', u.role
          ) as author
        from public."Announcement" a
        left join public."User" u on u.id = a."authorId"
        where a.id = any($1::text[])
      `,
      [ids],
    );

    const lookup = new Map(rows.map((announcement) => [announcement.id, announcement]));
    return ids
      .map((id) => {
        const announcement = lookup.get(id);
        if (!announcement) return null;

        return {
          ...announcement,
          memoryScore: memoryItems.find((item) => item.sourceId === id)?.similarity ?? 0,
        };
      })
      .filter(Boolean);
  } catch (error) {
    memoryDisabledReason = `Vector memory disabled: ${error.message || 'unknown error'}`;
    console.warn(memoryDisabledReason);
    return [];
  }
}

function formatMemoryContext(memoryItems) {
  if (!memoryItems.length) return '';

  return memoryItems
    .map((item, index) => {
      const score = typeof item.similarity === 'number' ? item.similarity.toFixed(2) : '0.00';
      return `${index + 1}. [${score}] ${item.content}`;
    })
    .join('\n\n');
}

function extractLatestUserText(uiMessages) {
  if (!Array.isArray(uiMessages)) return '';

  for (let index = uiMessages.length - 1; index >= 0; index -= 1) {
    const message = uiMessages[index];
    if (message?.role !== 'user') continue;

    const pieces = [];
    if (Array.isArray(message.parts)) {
      for (const part of message.parts) {
        if (part?.type === 'text' && typeof part.text === 'string') {
          pieces.push(part.text);
        }
      }
    }

    if (typeof message.content === 'string') {
      pieces.push(message.content);
    }

    if (typeof message.text === 'string') {
      pieces.push(message.text);
    }

    const combined = compact(pieces.join(' '));
    if (combined) return combined;
  }

  return '';
}

async function buildMemoryRagContext(uiMessages) {
  try {
    const query = extractLatestUserText(uiMessages);
    if (!query) return '';

    const memoryItems = await searchMemoryItems(query, 5);
    return formatMemoryContext(memoryItems);
  } catch (error) {
    memoryDisabledReason = `Vector memory disabled: ${error.message || 'unknown error'}`;
    console.warn(memoryDisabledReason);
    return '';
  }
}

module.exports = {
  buildAnnouncementMemoryText,
  buildAnnouncementMemoryMetadata,
  isIndexableAnnouncement,
  syncAnnouncementMemory,
  searchMemoryItems,
  searchAnnouncementsByMemory,
  formatMemoryContext,
  extractLatestUserText,
  buildMemoryRagContext,
  ensureMemorySchema,
};
