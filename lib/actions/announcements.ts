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

    return { success: true, data: announcements };
  } catch (error) {
    console.error('Database query failed:', error);
    return { success: false, error: 'Database connection failed' };
  }
}

export async function getMyAnnouncements() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    const announcements = await prisma.announcement.findMany({
      where: { authorId: user.id },
      include: {
        meetingRequests: { include: { requester: true, proposedSlots: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: announcements };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to fetch your announcements' };
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
    console.error(error);
    return { success: false, error: 'Failed to create announcement' };
  }
}

export async function getAnnouncementById(id: string) {
  try {
    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: { author: true },
    });
    if (!announcement) {
      return { success: false, error: 'Project not found' };
    }
    return { success: true, data: announcement };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to fetch project details' };
  }
}

export async function toggleAnnouncementStatus(id: string, newStatus: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    const updated = await prisma.announcement.update({
      where: { id, authorId: user.id },
      data: { status: newStatus as any }
    });
    revalidatePath('/my-announcements');
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: 'Failed to update status' };
  }
}

