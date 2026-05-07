'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function sendChatMessage(meetingRequestId: string, content: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const message = content.trim()

  if (!message) {
    return { success: false, error: 'Message cannot be empty' }
  }

  if (message.length > 4000) {
    return { success: false, error: 'Message is too long' }
  }

  try {
    const request = await prisma.meetingRequest.findUnique({
      where: { id: meetingRequestId },
      select: {
        id: true,
        requesterId: true,
        recipientId: true,
      },
    })

    if (!request) {
      return { success: false, error: 'Thread not found' }
    }

    if (![request.requesterId, request.recipientId].includes(user.id)) {
      return { success: false, error: 'Unauthorized' }
    }

    const existingConv = await prisma.conversation.findUnique({
      where: { id: meetingRequestId },
      select: { id: true },
    })

    const conversation = existingConv || await prisma.conversation.create({
      data: {
        id: meetingRequestId,
        participants: {
          create: [
            { userId: request.requesterId },
            { userId: request.recipientId },
          ],
        },
      },
      select: { id: true },
    })

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: user.id,
        content: message,
      },
    })

    revalidatePath(`/chats/${meetingRequestId}`)
    revalidatePath('/chats')

    return { success: true, data: { conversationId: conversation.id } }
  } catch (error) {
    console.error('Send chat message error:', error)
    return { success: false, error: 'Failed to send message' }
  }
}
