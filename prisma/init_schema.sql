-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ENGINEER', 'HEALTHCARE_PROFESSIONAL', 'ADMIN');

-- CreateEnum
CREATE TYPE "AnnouncementStatus" AS ENUM ('DRAFT', 'ACTIVE', 'MEETING_SCHEDULED', 'PARTNER_FOUND', 'EXPIRED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProjectStage" AS ENUM ('IDEA', 'CONCEPT_VALIDATION', 'PROTOTYPE_DEVELOPED', 'PILOT_TESTING', 'PRE_DEPLOYMENT');

-- CreateEnum
CREATE TYPE "CommitmentLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "CollaborationType" AS ENUM ('ADVISOR', 'CO_FOUNDER', 'RESEARCH_PARTNER');

-- CreateEnum
CREATE TYPE "Confidentiality" AS ENUM ('PUBLIC_PITCH', 'DETAILS_IN_MEETING');

-- CreateEnum
CREATE TYPE "MeetingRequestStatus" AS ENUM ('PENDING', 'SLOTS_PROPOSED', 'COUNTER_PROPOSED', 'CONFIRMED', 'DECLINED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "SlotStatus" AS ENUM ('PENDING', 'SELECTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_INTEREST', 'MEETING_REQUEST', 'SLOTS_PROPOSED', 'COUNTER_SLOTS_PROPOSED', 'SLOT_SELECTED', 'MEETING_DECLINED', 'MEETING_CANCELLED', 'PARTNER_FOUND', 'ACCOUNT_SUSPENDED', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'REGISTER', 'EMAIL_VERIFIED', 'POST_CREATED', 'POST_EDITED', 'POST_CLOSED', 'POST_EXPIRED', 'POST_ARCHIVED', 'POST_REMOVED_BY_ADMIN', 'MEETING_REQUEST_SENT', 'MEETING_REQUEST_ACKNOWLEDGED', 'MEETING_REQUEST_CONFIRMED', 'MEETING_REQUEST_DECLINED', 'MEETING_REQUEST_CANCELLED', 'PARTNER_FOUND_MARKED', 'ADMIN_USER_SUSPENDED', 'ADMIN_USER_REACTIVATED', 'DATA_EXPORT_REQUESTED', 'ACCOUNT_DELETED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "role" "Role" NOT NULL DEFAULT 'ENGINEER',
    "name" TEXT,
    "institution" TEXT,
    "city" TEXT,
    "country" TEXT,
    "bio" TEXT,
    "expertise" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "expertiseNeeded" TEXT NOT NULL,
    "projectStage" "ProjectStage" NOT NULL,
    "commitmentLevel" "CommitmentLevel" NOT NULL,
    "collaborationType" "CollaborationType",
    "confidentiality" "Confidentiality" NOT NULL,
    "publicPitch" TEXT,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "status" "AnnouncementStatus" NOT NULL DEFAULT 'DRAFT',
    "expiresAt" TIMESTAMP(3),
    "autoClose" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingRequest" (
    "id" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "ndaAccepted" BOOLEAN NOT NULL DEFAULT false,
    "ndaAcceptedAt" TIMESTAMP(3),
    "status" "MeetingRequestStatus" NOT NULL DEFAULT 'PENDING',
    "agreedSlot" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeetingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeSlot" (
    "id" TEXT NOT NULL,
    "meetingRequestId" TEXT NOT NULL,
    "proposedBy" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "SlotStatus" NOT NULL DEFAULT 'PENDING',
    "round" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "TimeSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "linkUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "role" "Role",
    "actionType" "AuditAction" NOT NULL,
    "targetEntity" TEXT,
    "result" TEXT NOT NULL,
    "ipAddress" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Announcement_authorId_idx" ON "Announcement"("authorId");

-- CreateIndex
CREATE INDEX "Announcement_status_createdAt_idx" ON "Announcement"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Announcement_domain_city_idx" ON "Announcement"("domain", "city");

-- CreateIndex
CREATE INDEX "Announcement_createdAt_idx" ON "Announcement"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "MeetingRequest_announcementId_idx" ON "MeetingRequest"("announcementId");

-- CreateIndex
CREATE INDEX "MeetingRequest_requesterId_idx" ON "MeetingRequest"("requesterId");

-- CreateIndex
CREATE INDEX "MeetingRequest_recipientId_idx" ON "MeetingRequest"("recipientId");

-- CreateIndex
CREATE INDEX "MeetingRequest_status_createdAt_idx" ON "MeetingRequest"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "MeetingRequest_createdAt_idx" ON "MeetingRequest"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "TimeSlot_meetingRequestId_idx" ON "TimeSlot"("meetingRequestId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_createdAt_idx" ON "Notification"("userId", "isRead", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_actionType_createdAt_idx" ON "AuditLog"("actionType", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingRequest" ADD CONSTRAINT "MeetingRequest_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingRequest" ADD CONSTRAINT "MeetingRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingRequest" ADD CONSTRAINT "MeetingRequest_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_meetingRequestId_fkey" FOREIGN KEY ("meetingRequestId") REFERENCES "MeetingRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

