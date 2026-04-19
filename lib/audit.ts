import prisma from '@/lib/prisma';
import { AuditAction, Role } from '@prisma/client';

/**
 * Standard utility for logging actions to the AuditLog table.
 */
export async function logAction({
  userId,
  role,
  actionType,
  targetEntity,
  result = 'success',
  ipAddress,
  metadata,
}: {
  userId?: string;
  role?: Role;
  actionType: AuditAction;
  targetEntity?: string;
  result?: string;
  ipAddress?: string;
  metadata?: any;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        role,
        actionType,
        targetEntity,
        result,
        ipAddress,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      },
    });
  } catch (error) {
    // We don't want to crash the main operation if logging fails,
    // but we should at least log it to the console for developers.
    console.error('Failed to write audit log:', error);
  }
}
