const test = require('node:test');
const assert = require('node:assert/strict');

const { buildAnnouncementMemoryText, extractLatestUserText, buildMemoryRagContext } = require('./vector-memory');

test('announcement memory text excludes personal identity fields', () => {
  const content = buildAnnouncementMemoryText({
    id: 'ann_1',
    title: 'Remote Patient Monitoring in Emergency Medicine',
    domain: 'Emergency Medicine',
    explanation: 'Build a secure monitoring workflow for real-time clinical signals.',
    expertiseNeeded: 'Machine Learning, Full-Stack Development',
    projectStage: 'CONCEPT_VALIDATION',
    commitmentLevel: 'MEDIUM',
    collaborationType: 'ADVISOR',
    confidentiality: 'PUBLIC_PITCH',
    publicPitch: 'Seeking engineers for a remote monitoring prototype.',
    city: 'Berlin',
    country: 'Germany',
    status: 'ACTIVE',
    author: {
      name: 'Dr. Sarah Smith',
      institution: 'St. Thomas Hospital',
    },
  });

  assert.match(content, /Remote Patient Monitoring/);
  assert.match(content, /Emergency Medicine/);
  assert.match(content, /Machine Learning/);
  assert.doesNotMatch(content, /Dr\. Sarah Smith/);
  assert.doesNotMatch(content, /St\. Thomas Hospital/);
});

test('latest user text is extracted from UI messages', () => {
  const query = extractLatestUserText([
    { role: 'assistant', parts: [{ type: 'text', text: 'hello' }] },
    { role: 'user', parts: [{ type: 'text', text: 'find' }, { type: 'text', text: 'vector search' }] },
    { role: 'assistant', parts: [{ type: 'text', text: 'ok' }] },
    { role: 'user', parts: [{ type: 'text', text: 'semantic memory for active announcements' }] },
  ]);

  assert.equal(query, 'semantic memory for active announcements');
});

test('memory rag context fails open when storage is unavailable', async () => {
  const ctx = await buildMemoryRagContext([
    { role: 'user', parts: [{ type: 'text', text: 'prove you have rag' }] },
  ]);

  assert.equal(ctx, '');
});
