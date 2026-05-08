import React from 'react';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import ChatSidebar, { ChatThreadSummary } from '@/components/ChatSidebar';
import ChatWindow, { ChatThreadDetail } from '@/components/ChatWindow';

export const dynamic = 'force-dynamic';

function roleLabel(role?: string | null) {
  switch (role) {
    case 'HEALTHCARE_PROFESSIONAL':
      return 'Healthcare Professional';
    case 'ENGINEER':
      return 'Engineer / Tech Expert';
    case 'ADMIN':
      return 'Administrator';
    default:
      return 'Collaborator';
  }
}

function initialsFrom(name?: string | null, fallback = 'TH') {
  if (!name) return fallback;
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return fallback;
  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

async function loadConversation(requestId: string) {
  return prisma.conversation.findUnique({
    where: {
      id: requestId,
    },
    include: {
      messages: {
        include: {
          sender: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });
}

async function buildThreadSummary(userId: string, request: any): Promise<ChatThreadSummary & ChatThreadDetail> {
  const isOutgoing = request.requesterId === userId;
  const partner = isOutgoing ? request.recipient : request.requester;
  const partnerName = partner?.name || 'Unknown collaborator';
  const partnerInstitution = partner?.institution || 'Institution not shared';
  const location = [partner?.city, partner?.country].filter(Boolean).join(', ') || 'Location not shared';
  const direction = isOutgoing ? 'outgoing' : 'incoming';
  const status = request.status as string;
  const conversation = await loadConversation(request.id);

  return {
    id: request.id,
    requestId: request.id,
    title: request.announcement.title,
    partnerName,
    partnerRole: roleLabel(partner?.role),
    partnerInstitution,
    domain: request.announcement.domain || 'Medical',
    status,
    preview: request.message.slice(0, 96),
    updatedAt: request.updatedAt.toISOString(),
    createdAt: request.createdAt.toISOString(),
    direction,
    threadLabel: isOutgoing ? 'Sent request' : 'Incoming request',
    unread: isOutgoing ? 0 : status === 'PENDING' ? 1 : 0,
    initials: initialsFrom(partnerName),
    message: request.message,
    announcedBy: request.announcement.author?.name || 'Research lead',
    announcementId: request.announcementId,
    partnerId: partner?.id || null,
    conversationId: conversation?.id || null,
    location,
    expertiseNeeded: request.announcement.expertiseNeeded || 'Not specified',
    commitmentLevel: request.announcement.commitmentLevel,
    collaborationType: request.announcement.collaborationType,
    projectStage: request.announcement.projectStage,
    confidentiality: request.announcement.confidentiality,
    announcement: {
      id: request.announcement.id,
      title: request.announcement.title,
      domain: request.announcement.domain,
      explanation: request.announcement.explanation,
      expertiseNeeded: request.announcement.expertiseNeeded,
      projectStage: request.announcement.projectStage,
      commitmentLevel: request.announcement.commitmentLevel,
      collaborationType: request.announcement.collaborationType,
      confidentiality: request.announcement.confidentiality,
      publicPitch: request.announcement.publicPitch,
      city: request.announcement.city,
      country: request.announcement.country,
      status: request.announcement.status,
      createdAt: request.announcement.createdAt.toISOString(),
      author: request.announcement.author
        ? {
            id: request.announcement.author.id,
            name: request.announcement.author.name,
            institution: request.announcement.author.institution,
            role: request.announcement.author.role,
          }
        : null,
    },
    proposedSlots: (request.proposedSlots || []).map((slot: any) => ({
      id: slot.id,
      startTime: slot.startTime.toISOString(),
      endTime: slot.endTime.toISOString(),
      status: slot.status,
    })),
    agreedSlot: request.agreedSlot ? request.agreedSlot.toISOString() : null,
    messages: [
      {
        id: `${request.id}-initial`,
        senderId: isOutgoing ? userId : partner?.id || request.requesterId,
        senderName: isOutgoing ? 'You' : partnerName,
        timestamp: request.createdAt.toISOString(),
        body: request.message,
        tone: isOutgoing ? 'outgoing' : 'incoming',
      },
      ...(conversation?.messages || []).map((message: any) => ({
        id: message.id,
        senderId: message.senderId,
        senderName: message.sender?.name || 'Participant',
        timestamp: message.createdAt.toISOString(),
        body: message.content,
        tone: message.senderId === userId ? 'outgoing' : 'incoming',
      })),
    ],
    canSendMessages: Boolean(conversation) && !['CANCELLED', 'DECLINED'].includes(status),
    signal: isOutgoing ? 'Waiting for reply' : status === 'PENDING' ? 'Needs review' : 'In progress',
  } as ChatThreadDetail & ChatThreadSummary;
}

async function loadThreads() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const requests = await prisma.meetingRequest.findMany({
    where: {
      OR: [
        { requesterId: user.id },
        { recipientId: user.id },
      ],
    },
    include: {
      requester: true,
      recipient: true,
      announcement: {
        include: {
          author: true,
        },
      },
      proposedSlots: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return Promise.all(requests.map((request) => buildThreadSummary(user.id, request)));
}

function Workspace({ threads, selectedId }: { threads: ChatThreadDetail[]; selectedId?: string }) {
  const selected = threads.find((thread) => thread.id === selectedId) || threads[0] || null;

  return (
    <div className="chat-shell">
      <div className="chat-grid">
        <ChatSidebar threads={threads} selectedId={selected?.id} />
        <ChatWindow thread={selected} />
      </div>
    </div>
  );
}

export default async function ChatsPage() {
  const threads = await loadThreads();
  return <Workspace threads={threads} />;
}
