'use server';

import { logAction } from '@/lib/audit';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { syncAnnouncementMemory } from '@/lib/vector-memory';
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
  collaborationType: z.string().optional(),
  confidentiality: z.string().default('PUBLIC_PITCH'),
  expiresInDays: z.number().int().optional(),
  autoClose: z.boolean().default(false),
  saveAsDraft: z.boolean().default(false),
});



export async function getAnnouncements() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        authorId: { not: user.id },
        status: { in: ['ACTIVE', 'PARTNER_FOUND'] as any },
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

export async function getUserAnnouncementsByAuthorId(authorId: string) {
  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        authorId,
        status: { in: ['ACTIVE', 'PARTNER_FOUND', 'MEETING_SCHEDULED'] as any },
      },
      include: {
        author: {
          select: {
            name: true,
            institution: true,
            city: true,
            country: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });

    return { success: true, data: announcements };
  } catch (error) {
    console.error('Failed to fetch user announcements:', error);
    return { success: false, error: 'Failed to fetch user announcements' };
  }
}

export async function createAnnouncement(formData: any) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    const parseResult = announcementSchema.safeParse(formData);
    if (!parseResult.success) {
      console.error('Validation failed:', parseResult.error.flatten().fieldErrors);
      return { success: false, error: 'Invalid form data. Please check all fields.' };
    }
    const validatedData = parseResult.data;

    // Ensure user exists in Prisma, syncing by email to avoid unique constraint crashes
    await prisma.user.upsert({
      where: { email: user.email! },
      update: { id: user.id }, // Sync ID to match Supabase if it differs
      create: {
        id: user.id,
        email: user.email!,
        role: 'HEALTHCARE_PROFESSIONAL',
      }
    });
    
    // Calculate expiration if provided
    let expiresAt = null;
    if (validatedData.expiresInDays && validatedData.expiresInDays > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + validatedData.expiresInDays);
    }
    
    const status = validatedData.saveAsDraft ? 'DRAFT' : 'ACTIVE';

    const announcement = await prisma.announcement.create({
      data: { 
        title: validatedData.title,
        domain: validatedData.domain,
        explanation: validatedData.explanation,
        expertiseNeeded: validatedData.expertiseNeeded,
        projectStage: validatedData.projectStage as any,
        commitmentLevel: validatedData.commitmentLevel as any,
        collaborationType: validatedData.collaborationType ? (validatedData.collaborationType as any) : null,
        publicPitch: validatedData.publicPitch,
        city: validatedData.city,
        country: validatedData.country,
        confidentiality: validatedData.confidentiality as any,
        autoClose: validatedData.autoClose,
        expiresAt: expiresAt,
        authorId: user.id, 
        status: status as any
      },
    });

    await syncAnnouncementMemory(announcement);

    await logAction({
      userId: user.id,
      actionType: 'POST_CREATED',
      targetEntity: `Announcement:${announcement.id}`,
      result: 'success',
    });
    revalidatePath('/dashboard');
    revalidatePath('/my-announcements');
    return { success: true, data: announcement };
  } catch (error: any) {
    console.error('Create announcement error:', error);
    return { success: false, error: error.message || 'Failed to create announcement' };
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

    await syncAnnouncementMemory(updated);

    await logAction({
      userId: user.id,
      actionType: newStatus === 'PARTNER_FOUND' ? 'PARTNER_FOUND_MARKED' : 'POST_EDITED',
      targetEntity: `Announcement:${id}`,
      result: 'success',
      metadata: { newStatus }
    });
    revalidatePath('/my-announcements');
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: 'Failed to update status' };
  }
}

export async function updateAnnouncement(id: string, formData: z.infer<typeof announcementSchema>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    const validatedData = announcementSchema.parse(formData);
    
    // Calculate expiration if provided
    let expiresAt = null;
    if (validatedData.expiresInDays && validatedData.expiresInDays > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + validatedData.expiresInDays);
    }
    
    const status = validatedData.saveAsDraft ? 'DRAFT' : 'ACTIVE';

    const announcement = await prisma.announcement.update({
      where: { id, authorId: user.id }, // ensures only the owner can update
      data: { 
        title: validatedData.title,
        domain: validatedData.domain,
        explanation: validatedData.explanation,
        expertiseNeeded: validatedData.expertiseNeeded,
        projectStage: validatedData.projectStage as any,
        commitmentLevel: validatedData.commitmentLevel as any,
        collaborationType: validatedData.collaborationType ? (validatedData.collaborationType as any) : null,
        publicPitch: validatedData.publicPitch,
        city: validatedData.city,
        country: validatedData.country,
        confidentiality: validatedData.confidentiality as any,
        autoClose: validatedData.autoClose,
        expiresAt: expiresAt,
        status: status as any
      },
    });

    await syncAnnouncementMemory(announcement);

    await logAction({
      userId: user.id,
      actionType: 'POST_EDITED',
      targetEntity: `Announcement:${id}`,
      result: 'success',
    });

    revalidatePath('/dashboard');
    revalidatePath(`/board/${id}`);
    revalidatePath('/my-announcements');
    
    return { success: true, data: announcement };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to update post' };
  }
}
