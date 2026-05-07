'use server';

import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { unstable_noStore as noStore } from 'next/cache';
import { logAction } from '@/lib/audit';

export async function requestMeeting(announcementId: string, message: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // 1. Fetch announcement to get the recipient (author)
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      select: { authorId: true, title: true }
    });

    if (!announcement) {
      return { success: false, error: 'Project not found' };
    }

    if (announcement.authorId === user.id) {
      return { success: false, error: 'You cannot request a meeting for your own project.' };
    }

    // 2. Create meeting request
    const meetingRequest = await prisma.meetingRequest.create({
      data: {
        announcementId,
        requesterId: user.id,
        recipientId: announcement.authorId,
        message,
        status: 'PENDING' as any,
      }
    });

    // 3. Create notification for the author
    await prisma.notification.create({
      data: {
        userId: announcement.authorId,
        type: 'MEETING_REQUEST' as any,
        title: 'New Interest in Project',
        body: `Someone is interested in "${announcement.title}". View their message to proceed.`,
        linkUrl: `/board/${announcementId}`,
      }
    });

    // 4. Log the action
    await logAction({
      userId: user.id,
      actionType: 'MEETING_REQUEST_SENT',
      targetEntity: `MeetingRequest:${meetingRequest.id}`,
      result: 'success',
    });

    revalidatePath(`/board/${announcementId}`);
    return { success: true, data: meetingRequest };
  } catch (error) {
    console.error('Error requesting meeting:', error);
    return { success: false, error: 'Failed to send interest request' };
  }
}

export async function proposeSlots(meetingRequestId: string, slots: { startTime: Date, endTime: Date }[]) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    const meetingRequest = await prisma.meetingRequest.findUnique({
      where: { id: meetingRequestId },
      include: { announcement: true }
    });

    if (!meetingRequest) return { success: false, error: 'Not found' };
    if (meetingRequest.requesterId !== user.id && meetingRequest.recipientId !== user.id) {
      return { success: false, error: 'Forbidden' };
    }

    // Create time slots
    await prisma.timeSlot.createMany({
      data: slots.map(slot => ({
        meetingRequestId,
        proposedBy: user.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
      }))
    });

    // Update meeting request status
    await prisma.meetingRequest.update({
      where: { id: meetingRequestId },
      data: { status: 'SLOTS_PROPOSED' as any }
    });

    // Notify the other party
    const recipientId = meetingRequest.requesterId === user.id ? meetingRequest.recipientId : meetingRequest.requesterId;
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'SLOTS_PROPOSED' as any,
        title: 'Meeting Slots Proposed',
        body: `Time slots have been proposed for "${meetingRequest.announcement.title}".`,
        linkUrl: `/my-requests/${meetingRequestId}`,
      }
    });

    // Log the action
    await logAction({
      userId: user.id,
      actionType: 'MEETING_REQUEST_ACKNOWLEDGED',
      targetEntity: `MeetingRequest:${meetingRequestId}`,
      result: 'success',
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed' };
  }
}

export async function getMySentRequests() {
  noStore();
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    const requests = await prisma.meetingRequest.findMany({
      where: { requesterId: user.id },
      include: {
        announcement: true,
        proposedSlots: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: requests };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to fetch sent requests' };
  }
}

export async function getMyReceivedRequests() {
  noStore();
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    const requests = await prisma.meetingRequest.findMany({
      where: { recipientId: user.id },
      include: {
        announcement: true,
        requester: { select: { name: true, institution: true, role: true } },
        proposedSlots: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: requests };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to fetch received requests' };
  }
}

export async function updateMeetingRequestStatus(requestId: string, status: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    const existing = await prisma.meetingRequest.findUnique({
      where: { id: requestId },
      select: { requesterId: true, recipientId: true }
    });

    if (!existing) return { success: false, error: 'Request not found' };
    if (existing.requesterId !== user.id && existing.recipientId !== user.id) {
      return { success: false, error: 'Forbidden' };
    }

    const updated = await prisma.meetingRequest.update({
      where: { id: requestId },
      data: { status: status as any },
      include: {
        announcement: { select: { title: true } },
        requester: { select: { id: true, name: true } }
      }
    });

    let conversationId: string | undefined;

    if (status === 'ACCEPTED') {
      const existingConv = await prisma.conversation.findUnique({
        where: { id: requestId },
        select: { id: true }
      });

      if (existingConv) {
        conversationId = existingConv.id;
      } else {
        const newConv = await prisma.conversation.create({
          data: {
            id: requestId,
            participants: {
              create: [
                { userId: updated.requesterId },
                { userId: updated.recipientId }
              ]
            }
          }
        });
        conversationId = newConv.id;
      }

      // Send a system message or notification
      await prisma.notification.create({
        data: {
          userId: updated.requesterId,
          type: 'MEETING_REQUEST' as any,
          title: 'Request Accepted',
          body: `Your interest in "${updated.announcement.title}" was accepted. You can now start chatting!`,
          linkUrl: `/chats/${conversationId}`,
        }
      });
    }

    revalidatePath('/my-announcements');
    revalidatePath('/chats');
    return { success: true, data: { ...updated, conversationId } };
  } catch(e) {
    console.error('Update status error:', e);
    return { success: false, error: 'Failed' };
  }
}

export async function confirmMeetingSlot(meetingRequestId: string, slotId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    const request = await prisma.meetingRequest.findUnique({
      where: { id: meetingRequestId },
      select: { requesterId: true, recipientId: true }
    });

    if (!request) return { success: false, error: 'Request not found' };
    if (request.requesterId !== user.id && request.recipientId !== user.id) {
      return { success: false, error: 'Forbidden' };
    }

    await prisma.timeSlot.updateMany({
      where: { meetingRequestId, id: { not: slotId } },
      data: { status: 'CANCELLED' as any }
    });

    await prisma.timeSlot.update({
      where: { id: slotId },
      data: { status: 'CONFIRMED' as any }
    });

    await prisma.meetingRequest.update({
      where: { id: meetingRequestId },
      data: { status: 'CONFIRMED' as any }
    });
    
    // Log the action
    await logAction({
      userId: user.id,
      actionType: 'MEETING_REQUEST_CONFIRMED',
      targetEntity: `MeetingRequest:${meetingRequestId}`,
      result: 'success',
      metadata: { slotId }
    });
    
    revalidatePath('/my-announcements');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed' };
  }
}


export async function cancelMeetingRequest(requestId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    const meetingRequest = await prisma.meetingRequest.findUnique({
      where: { id: requestId },
      select: { requesterId: true, recipientId: true, status: true }
    });

    if (!meetingRequest) return { success: false, error: 'Request not found' };

    // Only requester or recipient can cancel
    if (meetingRequest.requesterId !== user.id && meetingRequest.recipientId !== user.id) {
      return { success: false, error: 'Forbidden' };
    }

    const updated = await prisma.meetingRequest.update({
      where: { id: requestId },
      data: { status: 'CANCELLED' as any }
    });

    // Log the action
    await logAction({
      userId: user.id,
      actionType: 'MEETING_REQUEST_CANCELLED',
      targetEntity: `MeetingRequest:${requestId}`,
      result: 'success',
    });

    // Notify the other party
    const otherPartyId = meetingRequest.requesterId === user.id ? meetingRequest.recipientId : meetingRequest.requesterId;
    await prisma.notification.create({
      data: {
        userId: otherPartyId,
        type: 'MEETING_CANCELLED' as any,
        title: 'Meeting Request Cancelled',
        body: `A meeting request has been cancelled.`,
      }
    });

    revalidatePath('/my-requests');
    revalidatePath('/my-announcements');
    
    return { success: true, data: updated };
  } catch (error) {
    console.error('Error cancelling meeting:', error);
    return { success: false, error: 'Failed to cancel request' };
  }
}
