'use server';

import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logAction } from '@/lib/audit';
import { Role } from '@prisma/client';

/**
 * Verifies if the current user has the ADMIN role.
 * Throws an error if not authorized.
 */
async function verifyAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true }
  });

  if (!dbUser || dbUser.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required');
  }

  return { id: user.id, role: dbUser.role };
}

export async function getAdminDashboardStats() {
  try {
    await verifyAdmin();

    const totalUsers = await prisma.user.count();
    const activePosts = await prisma.announcement.count({ where: { status: 'ACTIVE' } });
    const totalMeetings = await prisma.meetingRequest.count({ where: { status: 'CONFIRMED' } });
    const suspendedUsers = await prisma.user.count({ where: { isSuspended: true } });
    
    // Partner Found Rate
    const partnerFoundCount = await prisma.announcement.count({ where: { status: 'PARTNER_FOUND' } });
    const totalClosedAnnouncements = await prisma.announcement.count({ 
      where: { status: { in: ['PARTNER_FOUND', 'EXPIRED', 'ARCHIVED'] } } 
    });
    const matchRate = totalClosedAnnouncements > 0 
      ? Math.round((partnerFoundCount / totalClosedAnnouncements) * 100) 
      : 0;

    // Recent audit logs
    const recentLogs = await prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true } } }
    });

    return {
      success: true,
      stats: {
        totalUsers,
        activePosts,
        totalMeetings,
        matchRate: `${matchRate}%`,
        suspendedUsers,
      },
      recentLogs: recentLogs.map(l => ({
        id: l.id,
        event: l.actionType,
        actor: l.user?.email || 'System',
        time: l.createdAt,
      }))
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAdminPosts(filters: { domain?: string, city?: string, status?: string } = {}) {
  try {
    await verifyAdmin();

    const where: any = {};
    if (filters.domain) where.domain = filters.domain;
    if (filters.city) where.city = filters.city;
    if (filters.status) where.status = filters.status;

    const posts = await prisma.announcement.findMany({
      where,
      include: { author: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, posts };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminRemovePost(postId: string, reason: string) {
  try {
    const admin = await verifyAdmin();

    await prisma.announcement.update({
      where: { id: postId },
      data: { status: 'ARCHIVED' as any }
    });

    await logAction({
      userId: admin.id,
      role: 'ADMIN',
      actionType: 'POST_REMOVED_BY_ADMIN',
      targetEntity: `Announcement:${postId}`,
      result: 'success',
      metadata: { reason }
    });

    revalidatePath('/admin/posts');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAdminUsers(filters: { role?: string } = {}) {
  try {
    await verifyAdmin();

    const where: any = {};
    if (filters.role) where.role = filters.role;

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, users };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminSuspendUser(userId: string, suspend: boolean) {
  try {
    const admin = await verifyAdmin();

    await prisma.user.update({
      where: { id: userId },
      data: { isSuspended: suspend }
    });

    await logAction({
      userId: admin.id,
      role: 'ADMIN',
      actionType: suspend ? 'ADMIN_USER_SUSPENDED' : 'ADMIN_USER_REACTIVATED',
      targetEntity: `User:${userId}`,
      result: 'success',
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAdminLogs(filters: { userId?: string, actionType?: string } = {}) {
  try {
    await verifyAdmin();

    const where: any = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.actionType) where.actionType = filters.actionType;

    const logs = await prisma.auditLog.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit for performance
    });

    return { success: true, logs };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function exportLogsCsv() {
  try {
    await verifyAdmin();

    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const header = 'Timestamp,User,Action,Target,Result\n';
    const rows = logs.map(l => {
      return `${l.createdAt.toISOString()},${l.user?.email || 'System'},${l.actionType},${l.targetEntity || ''},${l.result}`;
    }).join('\n');

    return { success: true, csv: header + rows };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getPostLifecycle(postId: string) {
  try {
    await verifyAdmin();

    const logs = await prisma.auditLog.findMany({
      where: {
        targetEntity: {
          contains: `Announcement:${postId}`
        }
      },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, logs };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
