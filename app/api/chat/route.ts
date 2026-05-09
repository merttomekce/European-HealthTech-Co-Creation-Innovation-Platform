import { createOpenAI } from '@ai-sdk/openai';
import { convertToModelMessages, streamText, tool } from 'ai';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getAuthProfile } from '@/lib/actions/profile';
import { buildMemoryRagContext, searchAnnouncementsByMemory } from '@/lib/vector-memory';

// Sanitize env vars
const rawBaseURL = (
  process.env.LOCAL_AI_BASE_URL ||
  (process.env.NODE_ENV !== 'production' ? 'http://127.0.0.1:8001/v1' : '')
).trim();
const rawApiKey = (
  process.env.LOCAL_AI_API_KEY ||
  (process.env.NODE_ENV !== 'production' ? '1234' : '')
).trim();
const hasLocalAI = Boolean(rawBaseURL && rawApiKey);

function normalizeLocalAIUrl(input: RequestInfo | URL) {
  const inputUrl =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;

  return inputUrl.replace(`/${rawApiKey}/`, '/');
}

// Configure Local AI with a custom fetch wrapper to strip non-standard chunks
const localAI = hasLocalAI
  ? createOpenAI({
      baseURL: rawBaseURL,
      apiKey: rawApiKey,
      fetch: async (input, options) => {
        const cleanURL = normalizeLocalAIUrl(input);
        console.log(`Companion Fetching: ${cleanURL}`);

        const response = await fetch(cleanURL, options);
        if (!response.body || options?.method !== 'POST') return response;

        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let lineBuffer = '';

        const transformer = new TransformStream({
          transform(chunk, controller) {
            lineBuffer += decoder.decode(chunk, { stream: true });
            const lines = lineBuffer.split('\n');
            lineBuffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.includes('stream-start')) {
                console.log('Companion: Dropping protocol chunk ->', trimmed);
                continue;
              }
              controller.enqueue(encoder.encode(line + '\n'));
            }
          },
          flush(controller) {
            if (lineBuffer && !lineBuffer.includes('stream-start')) {
              controller.enqueue(encoder.encode(lineBuffer));
            }
          }
        });

        const filteredStream = response.body.pipeThrough(transformer);
        return new Response(filteredStream, response);
      }
    })
  : null;

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    if (!localAI) {
      return new Response(JSON.stringify({ error: 'AI endpoint not configured' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { messages: uiMessages } = await req.json();
    const messages = await convertToModelMessages(uiMessages);
    const profile = await getAuthProfile();
    const memoryContext = await buildMemoryRagContext(uiMessages);

    const modelName = process.env.LOCAL_AI_MODEL || 'gemma-4-E4B-it-MLX-4bit';
    console.log(`Companion: Starting filtered stream for oMLX (${modelName})...`);

    const result = await streamText({
      model: localAI.chat(modelName), 
      system: `You are the HealthAI Agentic Companion, a high-fidelity AI assistant.
      User Profile: ${JSON.stringify(profile.data)}
      Current Date: ${new Date().toISOString()}
      ${memoryContext ? `\nRelevant platform memory:\n${memoryContext}\n` : ''}
      
      AGENTIC WORKFLOW:
      - To find projects: Use 'searchAnnouncements'.
      - To propose a new post: 
        1. Gather necessary context (title, idea, expertise needed).
        2. Call 'showAnnouncementDraft' to present a high-fidelity preview.
        3. Only call 'createAnnouncement' after the user explicitly confirms the draft.
      - To assist navigation: Use 'requestUIAction'. 
        * 'OPEN_POST_MODAL' triggers the manual project composer.
        * 'NAVIGATE_TO_BOARD' goes to the main feed.
      
      TONE: Surgical, professional, proactive. Use glassmorphic tech-noir terminology.`,
      messages,
      onFinish: () => {
        console.log('Companion: Stream finished successfully.');
      },
      tools: {
        searchAnnouncements: tool({
          description: 'Search for project announcements on the board',
          inputSchema: z.object({
            query: z.string().describe('The search query or keywords'),
          }),
          execute: async ({ query }) => {
            const data = await searchAnnouncementsByMemory(query, 5);
            return data;
          },
        }),
        showAnnouncementDraft: tool({
          description: 'Show a draft of an announcement to the user for review',
          inputSchema: z.object({
            title: z.string(),
            content: z.string(),
            type: z.enum(['RESEARCH', 'PILOT', 'CLINICAL_TRIAL', 'DEVELOPMENT', 'OTHER']),
            expertiseNeeded: z.string(),
            city: z.string().optional(),
            country: z.string().optional(),
          }),
          execute: async (args) => {
            // This is a "UI Tool" - the execution on the server just confirms the intent
            return { status: 'DRAFT_PROPOSED', ...args };
          },
        }),
        requestUIAction: tool({
          description: 'Request a UI action like opening a modal or navigating',
          inputSchema: z.object({
            action: z.enum(['OPEN_POST_MODAL', 'NAVIGATE_TO_BOARD', 'NAVIGATE_TO_CHATS']),
            metadata: z.record(z.any()).optional(),
          }),
          execute: async ({ action }) => {
            return { status: 'ACTION_REQUESTED', action };
          },
        }),
        createAnnouncement: tool({
          description: 'Directly create a new project announcement (use only if user explicitly says "post it")',
          inputSchema: z.object({
            title: z.string(),
            content: z.string(),
            type: z.enum(['RESEARCH', 'PILOT', 'CLINICAL_TRIAL', 'DEVELOPMENT', 'OTHER']),
            expertiseNeeded: z.string(),
          }),
          execute: async (args) => {
            if (!profile.data?.id) return { error: 'Unauthorized' };
            
            const newPost = await prisma.announcement.create({
              data: {
                title: args.title,
                domain: args.type,
                explanation: args.content,
                expertiseNeeded: args.expertiseNeeded,
                projectStage: 'IDEA',
                commitmentLevel: 'MEDIUM',
                collaborationType: null,
                confidentiality: 'PUBLIC_PITCH',
                publicPitch: args.content,
                authorId: profile.data.id,
                city: profile.data.city || 'Unknown',
                country: profile.data.country || 'Unknown',
                status: 'DRAFT',
                autoClose: false,
              },
            });
            return { success: true, postId: newPost.id };
          },
        }),
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Companion Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to connect to local AI' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
