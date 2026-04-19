'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getPlatformSettings() {
  try {
    let settings = await prisma.platformSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings) {
      // Initialize if not exists
      settings = await prisma.platformSettings.create({
        data: {
          id: 1,
          maintenanceMode: false,
          allowedDomains: '.edu, .ac.uk, .de, .fr, .nl, .se, .ch, .it',
          sessionTimeout: 24,
          postExpiry: 90,
          requireNDA: true,
          emailNotifications: true,
        }
      });
    }

    return { success: true, data: settings };
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return { success: false, error: 'Failed to fetch settings' };
  }
}

export async function updatePlatformSettings(data: {
  maintenanceMode?: boolean;
  allowedDomains?: string;
  sessionTimeout?: number;
  postExpiry?: number;
  requireNDA?: boolean;
  emailNotifications?: boolean;
}) {
  try {
    const updated = await prisma.platformSettings.upsert({
      where: { id: 1 },
      update: data,
      create: {
        id: 1,
        ...data
      }
    });

    revalidatePath('/admin/settings');
    return { success: true, data: updated };
  } catch (error) {
    console.error('Failed to update settings:', error);
    return { success: false, error: 'Failed to update settings' };
  }
}
