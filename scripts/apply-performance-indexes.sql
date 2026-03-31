-- HealthAI Performance Indexes (Zero-Downtime)
-- Execute this script directly in the Supabase SQL Editor to avoid locking the tables.
-- Note: "CONCURRENTLY" cannot be run inside a transaction (BEGIN/COMMIT).

-- 1. Announcement Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Announcement_authorId_idx" ON "Announcement"("authorId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Announcement_status_createdAt_idx" ON "Announcement"("status", "createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Announcement_domain_city_idx" ON "Announcement"("domain", "city");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Announcement_createdAt_idx" ON "Announcement"("createdAt" DESC);

-- 2. MeetingRequest Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "MeetingRequest_announcementId_idx" ON "MeetingRequest"("announcementId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "MeetingRequest_requesterId_idx" ON "MeetingRequest"("requesterId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "MeetingRequest_recipientId_idx" ON "MeetingRequest"("recipientId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "MeetingRequest_status_createdAt_idx" ON "MeetingRequest"("status", "createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "MeetingRequest_createdAt_idx" ON "MeetingRequest"("createdAt" DESC);

-- 3. TimeSlot Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "TimeSlot_meetingRequestId_idx" ON "TimeSlot"("meetingRequestId");

-- 4. Notification Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Notification_userId_isRead_createdAt_idx" ON "Notification"("userId", "isRead", "createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Notification_createdAt_idx" ON "Notification"("createdAt" DESC);

-- 5. AuditLog Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "AuditLog_actionType_createdAt_idx" ON "AuditLog"("actionType", "createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt" DESC);
