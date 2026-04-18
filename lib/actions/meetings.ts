'use server';

import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        actionType: 'MEETING_REQUEST_SENT',
        targetEntity: `MeetingRequest:${meetingRequest.id}`,
        result: 'success',
      }
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

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed' };
  }
}

export async function getMySentRequests() {
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
    const updated = await prisma.meetingRequest.update({
      where: { id: requestId },
      data: { status: status as any }
    });
    revalidatePath('/my-announcements');
    return { success: true, data: updated };
  } catch(e) {
    return { success: false, error: 'Failed' };
  }
}

export async function confirmMeetingSlot(meetingRequestId: string, slotId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  try {
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
    
    revalidatePath('/my-announcements');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed' };
  }
}

