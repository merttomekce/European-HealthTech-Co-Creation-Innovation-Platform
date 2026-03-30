'use server';

import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getNotifications() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20, // get the last 20 notifications
    });

    return { success: true, data: notifications };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, error: 'Failed' };
  }
}

export async function markAsRead(id: string) {
  try {
    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    revalidatePath('/'); // refresh notifications globally
    return { success: true, data: notification };
  } catch (error) {
    return { success: false, error: 'Failed' };
  }
}

export async function getUnreadCount() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return 0;

  try {
    const count = await prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false,
      },
    });
    return count;
  } catch (error) {
    return 0;
  }
}
