import { createOpenAI } from '@ai-sdk/openai';
import { convertToModelMessages, streamText, tool } from 'ai';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getAuthProfile } from '@/lib/actions/profile';
import { buildMemoryRagContext, searchAnnouncementsByMemory } from '@/lib/vector-memory';

// Sanitize env vars
const rawBaseURL = (process.env.LOCAL_AI_BASE_URL || 'http://127.0.0.1:8001/v1').trim();
const rawApiKey = (process.env.LOCAL_AI_API_KEY || '1234').trim();

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
const localAI = createOpenAI({
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
        // Append new chunk to buffer and split by lines
        lineBuffer += decoder.decode(chunk, { stream: true });
        const lines = lineBuffer.split('\n');
        
        // Keep the last partial line in the buffer
        lineBuffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          // SURGICAL FILTER: Drop only the line that contains stream-start
          if (trimmed.includes('stream-start')) {
            console.log('Companion: Dropping protocol chunk ->', trimmed);
            continue;
          }
          // Re-encode valid lines (including empty lines for SSE spacing)
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
});

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages: uiMessages } = await req.json();
    const messages = await convertToModelMessages(uiMessages);
    const profile = await getAuthProfile();
    const memoryContext = await buildMemoryRagContext(uiMessages);

    const modelName = process.env.LOCAL_AI_MODEL || 'gemma-4-E4B-it-MLX-4bit';
    console.log(`Companion: Starting filtered stream for oMLX (${modelName})...`);

    const result = await streamText({
      model: localAI.chat(modelName), 
      system: `You are the HealthAI Companion. You help users navigate the platform, find projects, and create announcements.
      User Profile: ${JSON.stringify(profile.data)}
      Current Date: ${new Date().toISOString()}
      ${memoryContext ? `\nRelevant public platform memory:\n${memoryContext}\n` : ''}
      
      Style: Professional, helpful, concise. 
      You can perform actions on behalf of the user using tools.`,
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
        createAnnouncement: tool({
          description: 'Create a new project announcement on the board',
          inputSchema: z.object({
            title: z.string(),
            content: z.string(),
            type: z.enum(['RESEARCH', 'PILOT', 'CLINICAL_TRIAL', 'DEVELOPMENT', 'OTHER']),
            expertiseNeeded: z.string(),
            city: z.string().optional(),
            country: z.string().optional(),
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
                city: args.city || profile.data.city || 'Unknown',
                country: args.country || profile.data.country || 'Unknown',
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
