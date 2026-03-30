'use server';

import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const announcementSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  domain: z.string().min(2, "Domain is required"),
  explanation: z.string().min(20, "Explanation must be detailed"),
  expertiseNeeded: z.string().min(2, "Please specify what you need from a partner"),
  projectStage: z.string(),
  commitmentLevel: z.string(),
  publicPitch: z.string().optional(),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
  confidentiality: z.string().default('PUBLIC_PITCH'),
});

const MOCK_ANNOUNCEMENTS = [
  {
    id: 'ann-001',
    title: 'AI-Driven Cardiology Diagnostics in Rural Areas',
    domain: 'Cardiology',
    explanation: 'We are developing a low-cost, AI-powered diagnostic tool for rural clinics to detect early-stage heart conditions.',
    projectStage: 'PILOT_TESTING',
    commitmentLevel: 'MODERATE',
    publicPitch: 'Bringing cardiology expertise to every village via AI-assisted edge computing.',
    createdAt: new Date().toISOString(),
    author: {
      name: 'Dr. Sarah Chen',
      role: 'HEALTHCARE_PRO',
      institution: 'Berlin Charité',
    }
  },
  {
    id: 'ann-002',
    title: 'Neuro-feedback Loop for Chronic Pain Management',
    domain: 'Neurology',
    explanation: 'Seeking firmware engineers to help build a closed-loop neuro-stimulation wearable for non-invasive pain relief.',
    projectStage: 'PROTOTYPING',
    commitmentLevel: 'INTENSIVE',
    publicPitch: 'Help us redefine chronic pain treatment with adaptive bio-electronic wearables.',
    createdAt: new Date().toISOString(),
    author: {
      name: 'Marcus Thorne',
      role: 'ENGINEER',
      institution: 'ETH Zurich',
    }
  }
];

export async function getAnnouncements() {
  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        status: 'ACTIVE' as any,
      },
      include: {
        author: {
          select: {
            name: true,
            institution: true,
            city: true,
            country: true,
            role: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, data: announcements.length > 0 ? announcements : MOCK_ANNOUNCEMENTS };
  } catch (error) {
    console.warn('Database connection failed, falling back to mock announcements.');
    return { success: true, data: MOCK_ANNOUNCEMENTS };
  }
}

export async function createAnnouncement(formData: z.infer<typeof announcementSchema>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    const validatedData = announcementSchema.parse(formData);
    const announcement = await prisma.announcement.create({
      data: { ...validatedData, authorId: user.id, status: 'ACTIVE' } as any,
    });
    revalidatePath('/board');
    return { success: true, data: announcement };
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false, error: error.issues[0].message };
    return { success: true, data: { id: 'mock-new-post', ...formData } }; // Mock success for demo
  }
}

export async function getAnnouncementById(id: string) {
  try {
    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: { author: true },
    });
    if (!announcement) {
      const mock = MOCK_ANNOUNCEMENTS.find(m => m.id === id);
      if (mock) return { success: true, data: mock };
      return { success: false, error: 'Project not found' };
    }
    return { success: true, data: announcement };
  } catch (error) {
    const mock = MOCK_ANNOUNCEMENTS.find(m => m.id === id);
    if (mock) return { success: true, data: mock };
    return { success: false, error: 'Failed to fetch project details' };
  }
}
