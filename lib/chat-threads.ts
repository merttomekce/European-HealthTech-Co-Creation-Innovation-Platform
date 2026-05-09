import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import type { ChatThreadSummary } from '@/components/ChatSidebar';
import type { ChatThreadDetail } from '@/components/ChatWindow';

type ChatRequestRow = {
  id: string;
  requesterId: string;
  recipientId: string;
  message: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  agreedSlot: Date | null;
  requester: {
    id: string;
    name: string | null;
    institution: string | null;
    city: string | null;
    country: string | null;
    role: string | null;
  };
  recipient: {
    id: string;
    name: string | null;
    institution: string | null;
    city: string | null;
    country: string | null;
    role: string | null;
  };
  announcement: {
    id: string;
    title: string;
    domain: string;
    explanation: string;
    expertiseNeeded: string;
    projectStage: string;
    commitmentLevel: string;
    collaborationType: string | null;
    confidentiality: string;
    publicPitch: string | null;
    city: string;
    country: string;
    status: string;
    createdAt: Date;
    author: {
      id: string;
      name: string | null;
      institution: string | null;
      role: string | null;
    } | null;
  };
  proposedSlots: Array<{
    id: string;
    startTime: Date;
    endTime: Date;
    status: string;
  }>;
};

type ConversationRow = {
  id: string;
  messages: Array<{
    id: string;
    senderId: string;
    content: string;
    createdAt: Date;
    sender: {
      id: string;
      name: string | null;
    } | null;
  }>;
} | null;

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

function baseSummary(userId: string, request: ChatRequestRow): ChatThreadSummary {
  const isOutgoing = request.requesterId === userId;
  const partner = isOutgoing ? request.recipient : request.requester;
  const partnerName = partner?.name || 'Unknown collaborator';

  return {
    id: request.id,
    title: request.announcement.title,
    partnerName,
    partnerRole: roleLabel(partner?.role),
    partnerInstitution: partner?.institution || 'Institution not shared',
    domain: request.announcement.domain || 'Medical',
    status: request.status,
    preview: request.message.slice(0, 96),
    updatedAt: request.updatedAt.toISOString(),
    direction: isOutgoing ? 'outgoing' : 'incoming',
    threadLabel: isOutgoing ? 'Sent request' : 'Incoming request',
    unread: isOutgoing ? 0 : request.status === 'PENDING' ? 1 : 0,
    initials: initialsFrom(partnerName),
  };
}

async function loadConversation(requestId: string): Promise<ConversationRow> {
  return prisma.conversation.findUnique({
    where: {
      id: requestId,
    },
    select: {
      id: true,
      messages: {
        select: {
          id: true,
          senderId: true,
          content: true,
          createdAt: true,
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

function buildThreadDetail(
  userId: string,
  request: ChatRequestRow,
  conversation: ConversationRow,
  allowPendingRecipientSend: boolean,
): ChatThreadDetail {
  const isOutgoing = request.requesterId === userId;
  const partner = isOutgoing ? request.recipient : request.requester;
  const partnerName = partner?.name || 'Unknown collaborator';
  const status = request.status;

  return {
    ...baseSummary(userId, request),
    requestId: request.id,
    createdAt: request.createdAt.toISOString(),
    message: request.message,
    announcedBy: request.announcement.author?.name || 'Research lead',
    announcementId: request.announcement.id,
    partnerId: partner?.id || null,
    location: [partner?.city, partner?.country].filter(Boolean).join(', ') || 'Location not shared',
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
      author: request.announcement.author,
    },
    proposedSlots: request.proposedSlots.map((slot) => ({
      id: slot.id,
      startTime: slot.startTime.toISOString(),
      endTime: slot.endTime.toISOString(),
      status: slot.status,
    })),
    agreedSlot: request.agreedSlot ? request.agreedSlot.toISOString() : null,
    conversationId: conversation?.id || null,
    messages: [
      {
        id: `${request.id}-initial`,
        senderId: isOutgoing ? userId : partner?.id || request.requesterId,
        senderName: isOutgoing ? 'You' : partnerName,
        timestamp: request.createdAt.toISOString(),
        body: request.message,
        tone: isOutgoing ? ('outgoing' as const) : ('incoming' as const),
      },
      ...(conversation?.messages || []).map((message) => ({
        id: message.id,
        senderId: message.senderId,
        senderName: message.sender?.name || 'Participant',
        timestamp: message.createdAt.toISOString(),
        body: message.content,
        tone: message.senderId === userId ? ('outgoing' as const) : ('incoming' as const),
      })),
    ],
    canSendMessages:
      !['CANCELLED', 'DECLINED'].includes(status) &&
      (Boolean(conversation) || (allowPendingRecipientSend && !isOutgoing && status === 'PENDING')),
  };
}

export async function loadChatWorkspace(
  selectedRequestId?: string,
  allowPendingRecipientSend = false,
): Promise<{
  userId: string;
  threads: ChatThreadSummary[];
  selectedThread: ChatThreadDetail | null;
}> {
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
    select: {
      id: true,
      requesterId: true,
      recipientId: true,
      message: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      agreedSlot: true,
      requester: {
        select: {
          id: true,
          name: true,
          institution: true,
          city: true,
          country: true,
          role: true,
        },
      },
      recipient: {
        select: {
          id: true,
          name: true,
          institution: true,
          city: true,
          country: true,
          role: true,
        },
      },
      announcement: {
        select: {
          id: true,
          title: true,
          domain: true,
          explanation: true,
          expertiseNeeded: true,
          projectStage: true,
          commitmentLevel: true,
          collaborationType: true,
          confidentiality: true,
          publicPitch: true,
          city: true,
          country: true,
          status: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              name: true,
              institution: true,
              role: true,
            },
          },
        },
      },
      proposedSlots: {
        select: {
          id: true,
          startTime: true,
          endTime: true,
          status: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  }) as ChatRequestRow[];

  const selectedRequest = selectedRequestId
    ? requests.find((request) => request.id === selectedRequestId) || null
    : requests[0] || null;

  const conversation = selectedRequest ? await loadConversation(selectedRequest.id) : null;

  return {
    userId: user.id,
    threads: requests.map((request) => baseSummary(user.id, request)),
    selectedThread: selectedRequest
      ? buildThreadDetail(user.id, selectedRequest, conversation, allowPendingRecipientSend)
      : null,
  };
}
