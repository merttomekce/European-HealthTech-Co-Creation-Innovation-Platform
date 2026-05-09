import prisma from '@/lib/prisma';

type Role = 'ENGINEER' | 'HEALTHCARE_PROFESSIONAL' | 'ADMIN';
type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'REGISTER'
  | 'EMAIL_VERIFIED'
  | 'POST_CREATED'
  | 'POST_EDITED'
  | 'POST_CLOSED'
  | 'POST_EXPIRED'
  | 'POST_ARCHIVED'
  | 'POST_REMOVED_BY_ADMIN'
  | 'MEETING_REQUEST_SENT'
  | 'MEETING_REQUEST_ACKNOWLEDGED'
  | 'MEETING_REQUEST_CONFIRMED'
  | 'MEETING_REQUEST_DECLINED'
  | 'MEETING_REQUEST_CANCELLED'
  | 'PARTNER_FOUND_MARKED'
  | 'ADMIN_USER_SUSPENDED'
  | 'ADMIN_USER_REACTIVATED'
  | 'DATA_EXPORT_REQUESTED'
  | 'ACCOUNT_DELETED';

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
